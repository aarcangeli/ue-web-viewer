import fs from "fs";
import path from "path";
import invariant from "tiny-invariant";
import type { ClassDeclaration, EnumDeclaration } from "ts-morph";
import { IndentationText, Project } from "ts-morph";

import type { ClassInfo, EnumInfo, LayoutDump, StructInfo } from "./LayoutDumpSchema";
import { getUhtName, logChange } from "./Options";
import { getClassName, getStructName, shortPackageName } from "./property-handler";

type SymbolType = "class" | "struct" | "enum";

/**
 * This class has two main purposes:
 *
 * - Storage ot TypeScript symbols (classes, structs, enums) generated in the project.
 * - Storage of layout dump symbols (classes, structs, enums) with helpful methods to find them.
 */
export class SymbolStorage {
  private project: Project;

  // Existing symbols
  private classByName: Map<string, ClassDeclaration> = new Map();
  private structByName: Map<string, ClassDeclaration> = new Map();
  private enumByName: Map<string, EnumDeclaration> = new Map();

  // Layout Dump symbols by name
  private classDumpByName: Map<string, ClassInfo>;
  private structDumpByName: Map<string, StructInfo>;
  private enumDumpByName: Map<string, EnumInfo>;

  constructor(
    private rootDirectory: string,
    private dump: LayoutDump,
  ) {
    this.project = new Project({
      manipulationSettings: { indentationText: IndentationText.TwoSpaces },
    });

    const flatClasses = this.dump.packages.flatMap((pkg) => pkg.classes);
    const flatStructs = this.dump.packages.flatMap((pkg) => pkg.structs);
    const flatEnums = this.dump.packages.flatMap((pkg) => pkg.enums);

    this.classDumpByName = new Map(flatClasses.map((cls) => [cls.className, cls]));
    this.structDumpByName = new Map(flatStructs.map((str) => [str.structName, str]));
    this.enumDumpByName = new Map(flatEnums.map((enm) => [enm.enumName, enm]));

    // For UBT, class names are unique, even across packages.
    console.assert(this.classDumpByName.size == flatClasses.length, "Duplicate class names found in dump.");
    console.assert(this.structDumpByName.size == flatStructs.length, "Duplicate struct names found in dump.");
    console.assert(this.enumDumpByName.size == flatEnums.length, "Duplicate enum names found in dump.");

    this.scanExistingClasses();

    console.log(
      `Found ${this.classByName.size} classes, ${this.structByName.size} structs, and ${this.enumByName.size} enums in the project.`,
    );
  }

  private getForgottenSymbols() {
    const allObjects = [];
    allObjects.push(...this.classByName.values());
    allObjects.push(...this.structByName.values());
    allObjects.push(...this.enumByName.values());
    return allObjects.filter((cls) => cls.wasForgotten());
  }

  getClassDump(packageName: string, className: string): ClassInfo {
    const existingClass = this.classDumpByName.get(className);
    invariant(existingClass, `Class ${className} not found in storage.`);
    invariant(packageName === existingClass.packageName, `Class ${className} is not in package ${packageName}.`);
    return existingClass;
  }

  getStructDump(packageName: string, structName: string): StructInfo {
    structName = getUhtName(structName);
    const existingStruct = this.structDumpByName.get(structName);
    invariant(existingStruct, `Struct ${structName} not found in storage.`);
    invariant(packageName === existingStruct.packageName, `Struct ${structName} is not in package ${packageName}.`);
    return existingStruct;
  }

  getEnumDump(packageName: string, enumName: string): EnumInfo {
    const existingEnum = this.enumDumpByName.get(enumName);
    invariant(existingEnum, `Enum ${enumName} not found in storage.`);
    invariant(packageName === existingEnum.packageName, `Enum ${enumName} is not in package ${packageName}.`);
    return existingEnum;
  }

  getAllClasses(): Array<[ClassDeclaration, ClassInfo]> {
    return Array.from(this.classByName.entries()).map(([name, cls]) => {
      const classInfo = this.classDumpByName.get(name);
      invariant(classInfo, `Class info not found for class ${name}.`);
      return [cls, classInfo];
    });
  }

  getAllStructs(): Array<[ClassDeclaration, StructInfo]> {
    return Array.from(this.structByName.entries()).map(([name, str]) => {
      const structInfo = this.structDumpByName.get(getUhtName(name));
      invariant(structInfo, `Struct info not found for struct ${name}.`);
      return [str, structInfo];
    });
  }

  getAllEnums(): Array<[EnumDeclaration, EnumInfo]> {
    return Array.from(this.enumByName.entries()).map(([name, enm]) => {
      const enumInfo = this.enumDumpByName.get(name);
      invariant(enumInfo, `Enum info not found for enum ${name}.`);
      return [enm, enumInfo];
    });
  }

  getOrCreateSymbol(packageName: string, type: "class" | "struct", symbolName: string): ClassDeclaration;
  getOrCreateSymbol(packageName: string, type: "enum", symbolName: string): EnumDeclaration;

  /**
   * Get or create a TypeScript class for the given C++ symbol (class, struct).
   *
   * @param packageName Package name, e.g. "/Script/CoreUObject".
   * @param type Type of the symbol, either "class", "struct", or "enum".
   * @param symbolName Object name, e.g. "StaticMesh" or "Vector" (without "U" or "F" prefix).
   */
  getOrCreateSymbol(packageName: string, type: SymbolType, symbolName: string): ClassDeclaration | EnumDeclaration {
    if (type == "enum") {
      return this.getOrCreateEnum(packageName, symbolName);
    }

    let existingClass = type == "class" ? this.classByName.get(symbolName) : this.structByName.get(symbolName);

    // Create the class if it doesn't exist
    if (!existingClass) {
      logChange(`Creating new ${type} ${symbolName}`);

      const dirName = type === "class" ? "objects" : type === "struct" ? "structs" : "enums";
      const filePath = path.join(this.rootDirectory, shortPackageName(packageName), dirName, `${symbolName}.ts`);
      const className = type === "class" ? getClassName(symbolName) : getStructName(symbolName);

      const sourceFile = this.project.createSourceFile(filePath, "", { overwrite: false });
      existingClass = sourceFile.addClass({
        name: className,
        isExported: true,
      });

      if (type === "class") {
        this.classByName.set(symbolName, existingClass);
      } else if (type === "struct") {
        this.structByName.set(symbolName, existingClass);
      }
    }

    invariant(!existingClass.wasForgotten(), `Class ${symbolName} was forgotten.`);
    return existingClass;
  }

  /**
   * Get or create a TypeScript class for the given C++ symbol (class, struct).
   *
   * @param packageName Package name, e.g. "/Script/CoreUObject".
   * @param symbolName Object name, e.g. "EStaticMeshPaintSupport" (in UE, the "E" is optional for enums, so we need to keep it when specified).
   */
  private getOrCreateEnum(packageName: string, symbolName: string): EnumDeclaration {
    let existingEnum = this.enumByName.get(symbolName);

    // Create the class if it doesn't exist
    if (!existingEnum) {
      logChange(`Creating new enums ${symbolName}`);

      const filePath = path.join(this.rootDirectory, shortPackageName(packageName), "enums", `${symbolName}.ts`);

      const sourceFile = this.project.createSourceFile(filePath, "", { overwrite: false });
      existingEnum = sourceFile.addEnum({
        name: symbolName,
        isExported: true,
      });
      this.enumByName.set(symbolName, existingEnum);
    }

    invariant(!existingEnum.wasForgotten(), `Enum ${symbolName} was forgotten.`);
    return existingEnum;
  }

  /**
   * Read and parse all existing TypeScript classes in the root directory.
   */
  private scanExistingClasses() {
    for (const fullPath of getAllTsFiles(this.rootDirectory)) {
      const sourceFile = this.project.addSourceFileAtPath(fullPath);

      for (const aClass of sourceFile.getClasses()) {
        const objectName = aClass.getName();
        if (objectName?.startsWith("U")) {
          const className = objectName.slice(1);
          if (this.classDumpByName.has(className)) {
            if (this.classByName.has(className)) {
              throw new Error(`Duplicate class found for object name "${className}" in file "${fullPath}".`);
            }
            this.classByName.set(className, aClass);
          }
        }
        if (objectName?.startsWith("F")) {
          const structName = objectName.slice(1);
          if (this.structDumpByName.has(getUhtName(structName))) {
            if (this.structByName.has(structName)) {
              throw new Error(`Duplicate struct found for object name "${structName}" in file "${fullPath}".`);
            }
            this.structByName.set(structName, aClass);
          }
        }
      }

      for (const anEnum of sourceFile.getEnums()) {
        const objectName = anEnum.getName();
        if (this.enumByName.has(objectName)) {
          throw new Error(`Duplicate enum found for object name "${objectName}" in file "${fullPath}".`);
        }
        this.enumByName.set(objectName, anEnum);
      }
    }
  }
}

function getAllTsFiles(dirPath: string): string[] {
  const result: string[] = [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      result.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".ts")) {
      result.push(fullPath);
    }
  }

  return result;
}
