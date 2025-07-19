import fs from "fs";
import path from "path";

import type {
  ChildPropertyInfo,
  ClassInfo,
  ClassRef,
  EnumInfo,
  EnumRef,
  LayoutDump,
  PackageInfo,
  PropertyInfo,
  StructInfo,
  StructRef,
} from "./LayoutDumpSchema";
import { EPropertyFlags } from "../../src/unreal-engine/properties/enums";
import invariant from "tiny-invariant";

// Get some paths
const layoutPath = path.join(__dirname, "LayoutDump.json");
const repoRoot = path.resolve(__dirname, "..", "..");
const outputDir = path.join(repoRoot, "src/unreal-engine/Layout");

function main() {
  console.log("Reading layout dump...");
  console.log(`Repository root: ${repoRoot}`);
  console.log(`Layout dump path: ${layoutPath}`);
  console.log(`Output directory: ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  const values = JSON.parse(fs.readFileSync(layoutPath, "utf-8")) as LayoutDump;

  const layoutGenerator = new TSLayoutGenerator(values);
  for (const aPackage of values.packages) {
    for (const aClass of aPackage.classes) {
      if (isInteresting(aPackage.packageName, aClass.className)) {
        layoutGenerator.generateClass(aPackage, aClass);
      }
    }
  }
}

function isInteresting(moduleName: string, className: string) {
  return className == "StaticMesh";
}

class TSLayoutGenerator {
  constructor(private dump: LayoutDump) {}

  private generators = new Map<string, boolean>();

  private getPackage(packageName: string) {
    return this.dump.packages.find((aPackage) => aPackage.packageName === packageName);
  }

  getClass(classRef: ClassRef): [PackageInfo, ClassInfo] | null {
    const aPackage = this.getPackage(classRef.package);
    const aClass = aPackage?.classes.find((aClass) => aClass.className === classRef.class);
    if (aPackage && aClass) {
      return [aPackage, aClass];
    }
    return null;
  }

  getStruct(structRef: StructRef): [PackageInfo, StructInfo] | null {
    const aPackage = this.getPackage(structRef.package);
    const aStruct = aPackage?.structs.find((aStruct) => aStruct.structName === structRef.struct);
    if (aPackage && aStruct) {
      return [aPackage, aStruct];
    }
    return null;
  }

  getEnum(enumRef: EnumRef): [PackageInfo, EnumInfo] | null {
    const aPackage = this.getPackage(enumRef.package);
    const aEnum = aPackage?.enums.find((aStruct) => aStruct.enumName === enumRef.enum);
    if (aPackage && aEnum) {
      return [aPackage, aEnum];
    }
    return null;
  }

  generateClass(aPackage: PackageInfo, aClass: ClassInfo) {
    this.doGenerate(`${aPackage.packageName}/${aClass.className}`, () => {
      new TSFileGenerator(this, aPackage.packageName, aClass.className).generateClass(aClass);
    });
  }

  generateStruct(aPackage: PackageInfo, aStruct: StructInfo) {
    this.doGenerate(`${aPackage.packageName}/${aStruct.structName}`, () => {
      new TSFileGenerator(this, aPackage.packageName, aStruct.structName).generateStruct(aStruct);
    });
  }

  generateEnum(aPackage: PackageInfo, aEnum: EnumInfo) {
    this.doGenerate(`${aPackage.packageName}/${aEnum.enumName}`, () => {
      new TSFileGenerator(this, aPackage.packageName, aEnum.enumName).generateEnum(aEnum);
    });
  }

  private doGenerate(name: string, fn: () => void) {
    const flag = this.generators.get(name);
    if (flag !== undefined) {
      // Already generated, skip.
      // Circular dependencies are in fact not a problem
      return;
    }

    this.generators.set(name, false);
    fn();
    this.generators.set(name, true);
  }
}

class TSFileGenerator {
  private imports: Map<string, string> = new Map();
  private symbolsInThisFile: Set<string> = new Set();
  private lines: string[] = [];
  private currentIndent = "";

  constructor(
    private generator: TSLayoutGenerator,
    private packageName: string,
    private fileName: string,
  ) {}

  get outputPath(): string {
    return path.join(outputDir, `${shortPackageName(this.packageName)}/${this.fileName}.ts`);
  }

  importClassType(aPackage: PackageInfo, aClass: ClassInfo): string {
    return this.importGeneric(aPackage, aClass.className, getClassName(aClass));
  }

  importStructType(aPackage: PackageInfo, aStruct: StructInfo): string {
    return this.importGeneric(aPackage, aStruct.structName, getStructName(aStruct));
  }

  importEnumType(aPackage: PackageInfo, aStruct: EnumInfo): string {
    return this.importGeneric(aPackage, aStruct.enumName, aStruct.enumName);
  }

  private importGeneric(aPackage: PackageInfo, fileName: string, symbolName: string): string {
    if (this.symbolsInThisFile.has(symbolName)) {
      // Already imported in this file, no need to do it again
      return symbolName;
    }
    // Generate the import statement
    const path =
      aPackage.packageName == this.packageName
        ? `./${fileName}`
        : `../${shortPackageName(aPackage.packageName)}/${fileName}`;
    const fullImport = `import type { ${symbolName} } from ${JSON.stringify(path)};`;
    this.addImport(symbolName, fullImport);
    return symbolName;
  }

  private addImport(symbolName: string, fullImport: string) {
    const existingImport = this.imports.get(symbolName);
    if (existingImport) {
      if (existingImport !== fullImport) {
        console.error(`ERROR: Duplicate import for ${symbolName} in package ${this.packageName}`);
      }
    } else {
      this.imports.set(symbolName, fullImport);
    }
  }

  resolveClassRef(classRef: ClassRef) {
    const values = this.generator.getClass(classRef);
    if (!values) {
      console.warn(`Could not resolve class reference ${classRef.class} in package ${classRef.package}`);
      return `Invalid__${classRef.class}`;
    }
    const [aPackage, aClass] = values;
    this.generator.generateClass(aPackage, aClass);
    return this.importClassType(aPackage, aClass);
  }

  resolveStructRef(aStruct: StructRef): string {
    const values = this.generator.getStruct(aStruct);
    if (!values) {
      console.warn(`Could not resolve struct reference ${aStruct.struct} in package ${aStruct.package}`);
      return `Invalid__${aStruct.struct}`;
    }
    const [aPackage, aClass] = values;
    this.generator.generateStruct(aPackage, aClass);
    return this.importStructType(aPackage, aClass);
  }

  resolveEnumRef(aEnum: EnumRef): string {
    const values = this.generator.getEnum(aEnum);
    if (!values) {
      console.warn(`Could not resolve struct reference ${aEnum.enum} in package ${aEnum.package}`);
      return `Invalid__${aEnum.enum}`;
    }
    const [aPackage, aEnun] = values;
    this.generator.generateEnum(aPackage, aEnun);
    return this.importEnumType(aPackage, aEnun);
  }

  generateClass(aClass: ClassInfo) {
    const properties = aClass.properties.filter((prop) => !(prop.flagsLower & EPropertyFlags.Transient));
    if (!properties.length && aClass.superClass) {
      // use type alias
      this.addLine(`// Empty class`);
      this.addLine(`export type ${getClassName(aClass)} = ${this.resolveClassRef(aClass.superClass)};`);
      writeFile(this.outputPath, this.composePage());
      return;
    }

    let line = `export interface ${getClassName(aClass)}`;
    this.symbolsInThisFile.add(getClassName(aClass));

    if (aClass.superClass) {
      line += ` extends ${this.resolveClassRef(aClass.superClass)}`;
    }

    line += ` {`;
    this.addLine(line);

    this.withIndent(() => {
      this.writeProperties(properties);

      // UObject is a special case, add specific methods
      if (aClass.className === "Object") {
        this.addLine(`get outer(): UObject | null;`);
        this.addLine(`get innerObjects(): ReadonlyArray<UObject>;`);
      }
    });

    this.addLine(`}`);

    writeFile(this.outputPath, this.composePage());
  }

  private writeProperties(properties: PropertyInfo[]) {
    for (const prop of properties) {
      this.addLine(`${prop.name}: ${this.generateType(prop)};`);
    }
  }

  generateStruct(aStruct: StructInfo) {
    this.addLine(`export class ${getStructName(aStruct)} {`);
    this.symbolsInThisFile.add(getStructName(aStruct));

    const properties = aStruct.properties.filter((prop) => !(prop.flagsLower & EPropertyFlags.Transient));

    if (properties.length) {
      this.withIndent(() => {
        // Fields
        this.writeProperties(properties);
        this.addLine("");

        this.addLine("constructor(props: {");
        this.withIndent(() => {
          for (const prop of properties) {
            this.addLine(`${prop.name}: ${this.generateType(prop)};`);
          }
        });
        this.addLine("}) {");
        this.withIndent(() => {
          for (const prop of properties) {
            this.addLine(`this.${prop.name} = props.${prop.name};`);
          }
        });
        this.addLine("}");
      });
      this.addLine(`}`);
    } else {
      this.appendToLines("}");
    }

    writeFile(this.outputPath, this.composePage());
  }

  generateEnum(aEnum: EnumInfo) {
    this.addLine(`export enum ${aEnum.enumName} {`);
    this.symbolsInThisFile.add(aEnum.enumName);

    this.withIndent(() => {
      for (const [enumName, enumValue] of Object.entries(aEnum.values)) {
        this.addLine(`${enumName} = ${enumValue},`);
      }
    });

    this.addLine(`}`);

    writeFile(this.outputPath, this.composePage());
  }

  generateType(property: ChildPropertyInfo): string {
    switch (property.type) {
      case "ByteProperty":
        if (property.enumType) {
          return this.resolveEnumRef(property.enumType);
        }
        return "number";
      case "Int8Property":
      case "Int16Property":
      case "IntProperty":
      case "UInt32Property":
      case "UInt16Property":
      case "FloatProperty":
      case "DoubleProperty":
        return "number";
      case "Int64Property":
      case "UInt64Property":
        return "bigint";
      case "BoolProperty":
        return "boolean";
      case "ObjectProperty":
        return this.resolveClassRef(property.objectType);
      case "WeakObjectProperty":
      case "LazyObjectProperty":
      case "SoftObjectProperty":
        break;
      case "ClassProperty":
      case "SoftClassProperty":
        return "Class";
      case "InterfaceProperty":
        break;
      case "NameProperty":
      case "StrProperty":
      case "Utf8StrProperty":
      case "AnsiStrProperty":
        return "string";
      case "ArrayProperty":
        return `Array<${this.generateType(property.innerType)}>`;
      case "MapProperty":
        return `Map<${this.generateType(property.keyType)}, ${this.generateType(property.valueType)}>`;
      case "SetProperty":
        break;
      case "StructProperty":
        return this.resolveStructRef(property.structType);
      case "DelegateProperty":
        break;
      case "MulticastInlineDelegateProperty":
        break;
      case "MulticastSparseDelegateProperty":
        break;
      case "TextProperty":
        break;
      case "EnumProperty":
        return this.resolveEnumRef(property.enumType);
      case "FieldPathProperty":
        break;
      case "OptionalProperty":
        break;
    }
    console.error("ERROR: generateType not implemented for property type:", property.type);
    return `Invalid__${property.type}`;
  }

  withIndent(callback: () => void) {
    const previousIndent = this.currentIndent;
    this.currentIndent += "  ";
    callback();
    this.currentIndent = previousIndent;
  }

  addLine(line: string) {
    this.lines.push(this.currentIndent + line);
  }

  private appendToLines(s: string) {
    invariant(this.lines.length > 0);
    this.lines[this.lines.length - 1] += s;
  }

  composePage() {
    const allLines = [];

    // Add header comments
    allLines.push(`// This file is auto-generated, do not edit directly.`);
    allLines.push("");

    // Add imports
    if (this.imports.size > 0) {
      allLines.push(
        ...Array.from(this.imports.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([, fullImport]) => fullImport),
      );
      allLines.push("");
    }

    // Add the generated lines
    allLines.push(...this.lines);

    return allLines;
  }
}

function shortPackageName(packageName: string): string {
  const parts = packageName.split("/");
  return parts[parts.length - 1];
}

function getClassName(aClass: ClassInfo): string {
  return `U${aClass.className}`;
}

function getStructName(aClass: StructInfo): string {
  return `F${aClass.structName}`;
}

function writeFile(outputPath: string, lines: string[]) {
  console.log(`Writing ${outputPath}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join("\n") + "\n", "utf-8");
}

main();
