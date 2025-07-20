import path from "path";
import type { ClassDeclaration, EnumDeclaration, JSDocableNode, NameableNode, Node, SourceFile } from "ts-morph";
import { SyntaxKind } from "ts-morph";

import type {
  ClassInfo,
  ClassRef,
  EnumInfo,
  EnumRef,
  LayoutDump,
  PropertyInfo,
  StructInfo,
  StructRef,
} from "./LayoutDumpSchema";
import { ExportLayoutOptions, getTypescriptName, logChange } from "./Options";
import type { TypeResolver } from "./property-handler";
import {
  getClassName,
  getInitializer,
  getPropertiesToExport,
  getPropertyType,
  getStructName,
} from "./property-handler";
import { SymbolStorage } from "./SymbolStorage";

type AnySymbol = ClassInfo | StructInfo | EnumInfo;

const allFlags = ["nosort"];

/**
 * This class is responsible for generating or updating TypeScript classes
 * while preserving existing custom methods, comments, and formatting.
 */
export class PartialClassGenerator {
  private storage = new SymbolStorage(this.rootDirectory, this.dump);

  private dirtyFiles: Set<SourceFile> = new Set();

  // Queue
  private queue: Set<AnySymbol> = new Set();
  private processingElements: Set<AnySymbol> = new Set();

  constructor(
    private rootDirectory: string,
    private dump: LayoutDump,
  ) {}

  updateExistingSymbols() {
    for (const [classDeclaration, classInfo] of this.storage.getAllClasses()) {
      this.doSyncClass(classDeclaration, classInfo);
    }
  }

  organizeImports() {
    this.dirtyFiles.forEach((sourceFile) => sourceFile.organizeImports());
  }

  flushSaves() {
    this.dirtyFiles.forEach((sourceFile) => sourceFile.saveSync());
  }

  syncClass(classInfo: ClassInfo) {
    const existingClass = this.storage.getOrCreateSymbol(classInfo.packageName, "class", classInfo.className);
    this.doSyncClass(existingClass, classInfo);
  }

  private doSyncClass(classDeclaration: ClassDeclaration, classInfo: ClassInfo) {
    if (this.addToProcessing(classInfo)) {
      console.log(`Syncing class ${classInfo.packageName}.U${classInfo.className}`);

      // Sync extension
      let expectedExtends: string | undefined = undefined;
      if (classInfo.superClass) {
        const resolver = this.makeResolver(classDeclaration.getSourceFile());
        expectedExtends = resolver.resolveClassRef(classInfo.superClass, false);
      }
      this.syncExtension(classDeclaration, expectedExtends);

      this.updateProperties(classDeclaration, getPropertiesToExport(classInfo.properties));
      this.dirtyFiles.add(classDeclaration.getSourceFile());
    }
  }

  private doSyncStruct(classDeclaration: ClassDeclaration, structInfo: StructInfo) {
    if (this.addToProcessing(structInfo)) {
      console.log(`Syncing struct ${structInfo.packageName}.F${structInfo.structName}`);

      // Sync extension
      let expectedExtends: string | undefined = undefined;
      if (structInfo.superStruct) {
        const resolver = this.makeResolver(classDeclaration.getSourceFile());
        expectedExtends = resolver.resolveStructRef(structInfo.superStruct, false);
      }
      this.syncExtension(classDeclaration, expectedExtends);

      this.updateProperties(classDeclaration, getPropertiesToExport(structInfo.properties));
      this.dirtyFiles.add(classDeclaration.getSourceFile());
    }
  }

  private doSyncEnum(enumDeclaration: EnumDeclaration, enumInfo: EnumInfo) {
    if (this.addToProcessing(enumInfo)) {
      console.log(`Syncing enum ${enumInfo.packageName}.${enumInfo.enumName}`);

      for (const { name, value } of enumInfo.values) {
        if (!enumDeclaration.getMember(name)) {
          logChange(`Adding new enum member ${name} with value ${value}`);
          enumDeclaration.addMember({
            name: name,
            initializer: value.toString(),
          });
        }
      }

      // Enforce enum member order
      if (ExportLayoutOptions.enforceEnumOrder) {
        const members = enumDeclaration.getMembers();
        members.sort((a, b) => {
          const aIndex = enumInfo.values.findIndex((v) => v.name === a.getName());
          const bIndex = enumInfo.values.findIndex((v) => v.name === b.getName());

          const isAFound = aIndex !== -1;
          const isBFound = bIndex !== -1;
          if (isAFound != isBFound) {
            // If one of them is not found, we want to push it to the end
            return isAFound ? -1 : 1;
          }

          return aIndex - bIndex;
        });
        for (let i = 0; i < members.length; i++) {
          if (members[i].getChildIndex() / 2 != i) {
            const structure = members[i].getStructure();
            members[i].remove();
            enumDeclaration.insertMember(i, structure);
            logChange(`Reordering enum member ${structure.name} to position ${i}`);
          }
        }
      }

      this.dirtyFiles.add(enumDeclaration.getSourceFile());
    }
  }

  private syncExtension(classDeclaration: ClassDeclaration, expectedExtends: string | undefined) {
    const originalExtends = classDeclaration.getExtends()?.getText();

    if (expectedExtends) {
      if (originalExtends !== expectedExtends) {
        logChange(`Updating extends from ${originalExtends} to ${expectedExtends}`);
        classDeclaration.setExtends(expectedExtends);
      }
    } else {
      if (originalExtends) {
        logChange(`Removing extends ${originalExtends}`);
        classDeclaration.removeExtends();
      }
    }
  }

  private addToQueue(info: AnySymbol) {
    if (!this.processingElements.has(info)) {
      this.queue.add(info);
    }
  }

  private addToProcessing(info: AnySymbol) {
    if (!this.processingElements.has(info)) {
      this.processingElements.add(info);
      return true;
    }
    return false;
  }

  processQueue() {
    while (this.queue.size > 0) {
      const next = [...this.queue];
      this.queue.clear();

      for (const item of next) {
        if (isClassInfo(item)) {
          const classDeclaration = this.storage.getOrCreateSymbol(item.packageName, "class", item.className);
          this.doSyncClass(classDeclaration, item);
        } else if (isStructInfo(item)) {
          const classDeclaration = this.storage.getOrCreateSymbol(
            item.packageName,
            "struct",
            getTypescriptName(item.structName),
          );
          this.doSyncStruct(classDeclaration, item);
        } else if (isEnumInfo(item)) {
          const enumDeclaration = this.storage.getOrCreateSymbol(item.packageName, "enum", item.enumName);
          this.doSyncEnum(enumDeclaration, item);
        }
      }
    }
  }

  private updateProperties(classDeclaration: ClassDeclaration, properties: Array<PropertyInfo>) {
    const resolver = this.makeResolver(classDeclaration.getSourceFile());
    const flags = getFlags(classDeclaration);

    // Add or update new properties
    for (const property of properties) {
      const newType = getPropertyType(property, resolver);
      const initializer = getInitializer(property, resolver);

      let existingProperty = classDeclaration.getProperty(property.name);
      if (existingProperty) {
        // Update existing property
        const oldPropertyType = existingProperty.getTypeNode()?.getText();
        if (newType !== oldPropertyType) {
          logChange(`Updating property ${property.name} type from ${oldPropertyType} to ${newType}`);
          existingProperty.setType(newType);
        }
        const oldInitializer = existingProperty.getInitializer()?.getText();
        if (initializer !== oldInitializer) {
          logChange(`Updating property ${property.name} initializer from ${oldInitializer} to ${initializer}`);
          existingProperty.setInitializer(initializer);
        }
      } else {
        // Add new property
        logChange(`Adding new property ${property.name} with type ${newType}`);

        existingProperty = classDeclaration.insertProperty(findPropertyInsertIndex(classDeclaration), {
          name: property.name,
          type: newType,
          initializer: initializer,
        });
      }

      if (ExportLayoutOptions.overrideJSDoc) {
        const description = `property ${property.name}`;
        const jsDocs = existingProperty.getJsDocs();
        if (jsDocs.length === 0) {
          existingProperty.addJsDoc({ description: description });
        } else {
          jsDocs[0].setDescription(description);
        }
        ensureBlankLineBefore(existingProperty);
      }
    }

    if (ExportLayoutOptions.enforcePropertyOrder && !flags.includes("nosort")) {
      const classProperties = classDeclaration.getProperties();

      // Sort properties by their original order in the dump
      classProperties.sort((a, b) => {
        const aIndex = properties.findIndex((p) => p.name === a.getName());
        const bIndex = properties.findIndex((p) => p.name === b.getName());

        const isAFound = aIndex !== -1;
        const isBFound = bIndex !== -1;
        if (isAFound != isBFound) {
          // If one of them is not found, we want to push it to the end
          return isAFound ? -1 : 1;
        }

        return aIndex - bIndex;
      });

      for (let i = 0; i < classProperties.length; i++) {
        classProperties[i].setOrder(i);
      }
    }
  }

  /**
   * The resolver is used to resolve class, struct, and enum references from other files.
   * This resolver tries to find an existing symbol in the current project, if not found,
   * it add to the queue.
   */
  private makeResolver(sourceFile: SourceFile): TypeResolver {
    return {
      resolveClassRef: (classRef: ClassRef, asType: boolean) => {
        this.addToQueue(this.storage.getClassDump(classRef.package, classRef.class));
        const existingClass = this.storage.getOrCreateSymbol(classRef.package, "class", classRef.class);
        const symbolName = getClassName(classRef.class);
        this.getOrCreateImport(sourceFile, existingClass.getSourceFile(), symbolName, asType);
        return symbolName;
      },
      resolveStructRef: (structRef: StructRef, asType: boolean) => {
        const structName = getTypescriptName(structRef.struct);
        this.addToQueue(this.storage.getStructDump(structRef.package, structName));
        const existingClass = this.storage.getOrCreateSymbol(structRef.package, "struct", structName);
        const symbolName = getStructName(structName);
        this.getOrCreateImport(sourceFile, existingClass.getSourceFile(), symbolName, asType);
        return symbolName;
      },
      resolveEnumRef: (enumRef: EnumRef, asType: boolean) => {
        this.addToQueue(this.storage.getEnumDump(enumRef.package, enumRef.enum));
        const existingEnum = this.storage.getOrCreateSymbol(enumRef.package, "enum", enumRef.enum);
        this.getOrCreateImport(sourceFile, existingEnum.getSourceFile(), enumRef.enum, asType);
        return enumRef.enum;
      },
      getEnumInfo: (enumRef) => {
        const aPackage = this.dump.packages.find((aPackage) => aPackage.packageName === enumRef.package);
        if (!aPackage) {
          throw new Error(`Package "${enumRef.package}" not found for enum "${enumRef.enum}".`);
        }
        const aEnum = aPackage?.enums.find((aStruct) => aStruct.enumName === enumRef.enum);
        if (!aEnum) {
          throw new Error(`Enum "${enumRef.enum}" not found in package "${enumRef.package}".`);
        }
        return aEnum;
      },
    };
  }

  private getOrCreateImport(sourceFile: SourceFile, destination: SourceFile, symbolName: string, asType: boolean) {
    if (sourceFile === destination) {
      // No need to import from the same file
      return;
    }

    const relativePath = getRelativeImportPath(sourceFile, destination.getFilePath());

    let importDecl = sourceFile.getImportDeclaration(relativePath);

    if (importDecl) {
      const alreadyImported = importDecl.getNamedImports().find((i) => i.getName() === symbolName);
      if (!alreadyImported) {
        importDecl.addNamedImport({
          name: symbolName,
          isTypeOnly: asType,
        });
      }

      // Remove the type-only flag if it was previously imported as type-only
      if (alreadyImported && !asType) {
        if (importDecl.isTypeOnly()) {
          if (importDecl.getNamedImports().length === 1) {
            importDecl.setIsTypeOnly(false);
          } else {
            // If there are other named imports, remove the item specifier and recreate a new import declaration
            alreadyImported.remove();
            importDecl = undefined;
          }
        } else if (alreadyImported.isTypeOnly()) {
          alreadyImported.setIsTypeOnly(false);
        }
      }
    }

    if (!importDecl) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: relativePath,
        isTypeOnly: asType,
        namedImports: [symbolName],
      });
    }
  }
}

function getRelativeImportPath(from: SourceFile, toPath: string): string {
  const fromDir = path.dirname(from.getFilePath());

  let relPath = path.relative(fromDir, toPath).replace(/\\/g, "/");

  // Remove the file extension if it exists
  relPath = relPath.replace(/\.[tj]sx?$/, "");

  // Ensure the path starts with "./" if it doesn't already
  if (!relPath.startsWith(".")) {
    relPath = "./" + relPath;
  }

  return relPath;
}

/**
 * Find the index where new properties should be inserted in a class definition.
 */
function findPropertyInsertIndex(classDefinition: ClassDeclaration) {
  const properties = classDefinition.getMembers();
  return findLastIndex(properties, (p) => p.getKind() === SyntaxKind.PropertyDeclaration) + 1;
}

function findLastIndex<T>(arr: T[], predicate: (value: T, index: number, array: T[]) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}

function ensureBlankLineBefore(existingProperty: Node) {
  const previousSibling = existingProperty.getPreviousSibling();
  const parent = existingProperty.getParent();
  if (!previousSibling || !parent) {
    return;
  }

  const whitespaceBeforeComment = existingProperty
    .getSourceFile()
    .getText()
    .substring(existingProperty.getFullStart(), existingProperty.getNonWhitespaceStart());
  const newlineCount = (whitespaceBeforeComment.match(/\n/g) || []).length;

  if (newlineCount < 2) {
    previousSibling.appendWhitespace("\n");
  }
}

function isClassInfo(symbol: AnySymbol): symbol is ClassInfo {
  return "className" in symbol;
}

function isStructInfo(symbol: AnySymbol): symbol is StructInfo {
  return "structName" in symbol;
}

function isEnumInfo(symbol: AnySymbol): symbol is EnumInfo {
  return "enumName" in symbol;
}

function getFlags(declaration: JSDocableNode & NameableNode) {
  const result: string[] = [];
  for (const jsDoc of declaration.getJsDocs()) {
    for (const row of jsDoc.getDescription().split("\n")) {
      const strings = row.split("LayoutGenerator:", 2);
      if (strings.length > 1) {
        const flags = strings[1].split(",").map((flag) => flag.trim());
        for (const flag of flags) {
          if (!allFlags.includes(flag)) {
            console.warn(`Unknown flag "${flag}" in JSDoc of ${declaration.getName()}`);
          }
          result.push(flag);
        }
      }
    }
  }
  return result;
}
