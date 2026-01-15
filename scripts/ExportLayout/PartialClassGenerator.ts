import type { ClassDeclaration, Decorator, EnumDeclaration, JSDocableNode, SourceFile } from "ts-morph";
import { Node, SyntaxKind } from "ts-morph";

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
import { getOrCreateImport } from "./ts-utils";
import invariant from "tiny-invariant";

type AnySymbol = ClassInfo | StructInfo | EnumInfo;

const allFlags = ["ignore"];

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
    for (const [classDeclaration, structInfo] of this.storage.getAllStructs()) {
      this.doSyncStruct(classDeclaration, structInfo);
    }
    for (const [enumDeclaration, enumInfo] of this.storage.getAllEnums()) {
      this.doSyncEnum(enumDeclaration, enumInfo);
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
      const resolver = this.makeResolver(classDeclaration.getSourceFile());
      const flags = getFlags(classDeclaration);
      if (flags.includes("ignore")) {
        console.log(`Ignoring class ${classInfo.packageName}.U${classInfo.className}`);
        return;
      }

      console.log(`Syncing class ${classInfo.packageName}.U${classInfo.className}`);

      // Sync extension
      let expectedExtends: string | undefined = undefined;
      if (classInfo.superClass) {
        expectedExtends = resolver.resolveClassRef(classInfo.superClass, false);
      }

      // Sync decorator
      let registerClass = classDeclaration.getDecorator("RegisterClass");
      const expectedArguments = [`${classInfo.packageName}.${classInfo.className}`];
      if (!registerClass) {
        logChange(`Adding RegisterClass decorator to ${classInfo.packageName}.U${classInfo.className}`);
        registerClass = classDeclaration.addDecorator({
          name: resolver.resolveSymbol("RegisterClass", false),
          arguments: expectedArguments,
        });
      }
      const currentArguments = getArgumentsInDecorator(registerClass);
      if (JSON.stringify(expectedArguments) !== JSON.stringify(currentArguments)) {
        logChange(
          `Updating RegisterClass decorator arguments from [${currentArguments.join(
            ", ",
          )}] to [${expectedArguments.join(", ")}]`,
        );
        registerClass.getArguments().forEach((arg) => registerClass.removeArgument(arg));
        registerClass.addArguments(expectedArguments.map((el) => JSON.stringify(el)));
      }

      this.syncExtension(classDeclaration, expectedExtends);

      this.updateProperties(classDeclaration, getPropertiesToExport(classInfo.properties));
      this.dirtyFiles.add(classDeclaration.getSourceFile());
    }
  }

  private doSyncStruct(classDeclaration: ClassDeclaration, structInfo: StructInfo) {
    if (this.addToProcessing(structInfo)) {
      const flags = getFlags(classDeclaration);
      if (flags.includes("ignore")) {
        console.log(`Ignoring struct ${structInfo.packageName}.F${structInfo.structName}`);
        return;
      }

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
      const flags = getFlags(enumDeclaration);
      if (flags.includes("ignore")) {
        console.log(`Ignoring enum ${enumInfo.packageName}.${enumInfo.enumName}`);
        return;
      }

      console.log(`Syncing enum ${enumInfo.packageName}.${enumInfo.enumName}`);

      for (const { name, value } of enumInfo.values) {
        if (!enumDeclaration.getMember(name)) {
          logChange(`Adding new enum member ${name} with value ${value}`);
          enumDeclaration.addMember({
            name: name,
            initializer: value.toString(),
          });
          continue;
        }

        // Verify the value of existing member
        const member = enumDeclaration.getMember(name);
        invariant(member);
        const currentValue = member.getInitializer()?.getText();
        if (currentValue !== value.toString()) {
          logChange(`Updating enum member ${name} value from ${currentValue} to ${value}`);
          member.setInitializer(value.toString());
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
          if (isAFound !== isBFound) {
            // If one of them is not found, we want to push it to the end
            return isAFound ? -1 : 1;
          }

          return aIndex - bIndex;
        });
        for (let i = 0; i < members.length; i++) {
          // For some reason, the child index is always even, so we divide by 2
          if (members[i].getChildIndex() / 2 !== i) {
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

    if (ExportLayoutOptions.warnExtraProperties) {
      const currentProperties = classDeclaration.getProperties().map((p) => p.getName());
      for (const currentProperty of currentProperties) {
        if (!properties.find((p) => p.name === currentProperty)) {
          console.warn(
            `Warning: Property "${currentProperty}" exists in class "${classDeclaration.getName()}" but not in layout dump.`,
          );
        }
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
        getOrCreateImport(sourceFile, existingClass.getSourceFile(), symbolName, asType);
        return symbolName;
      },
      resolveStructRef: (structRef: StructRef, asType: boolean) => {
        const structName = getTypescriptName(structRef.struct);
        this.addToQueue(this.storage.getStructDump(structRef.package, structName));
        const existingClass = this.storage.getOrCreateSymbol(structRef.package, "struct", structName);
        const symbolName = getStructName(structName);
        getOrCreateImport(sourceFile, existingClass.getSourceFile(), symbolName, asType);
        return symbolName;
      },
      resolveEnumRef: (enumRef: EnumRef, asType: boolean) => {
        this.addToQueue(this.storage.getEnumDump(enumRef.package, enumRef.enum));
        const existingEnum = this.storage.getOrCreateSymbol(enumRef.package, "enum", enumRef.enum);
        getOrCreateImport(sourceFile, existingEnum.getSourceFile(), enumRef.enum, asType);
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
      resolveSymbol: (name: string, asType: boolean) => {
        const variable = this.storage.resolveSymbol(name);
        getOrCreateImport(sourceFile, variable.getSourceFile(), name, asType);
        return name;
      },
    };
  }
}

/**
 * Find the index where new properties should be inserted in a class definition.
 */
function findPropertyInsertIndex(classDefinition: ClassDeclaration) {
  return classDefinition.getMembers().findLastIndex((p) => p.getKind() === SyntaxKind.PropertyDeclaration) + 1;
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

/**
 * Get layout generator flags from JSDoc comments.
 * Example: `LayoutGenerator: ignore`
 */
function getFlags(declaration: JSDocableNode & { getName(): string | undefined }) {
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

function getArgumentsInDecorator(decorator: Decorator): Array<string | undefined> {
  return decorator.getArguments().map((arg) => {
    if (Node.isStringLiteral(arg)) {
      return arg.getLiteralText();
    }
  });
}
