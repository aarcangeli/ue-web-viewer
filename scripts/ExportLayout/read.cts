import fs from "fs";
import path from "path";

import type {
  ChildPropertyInfo,
  ClassInfo,
  ClassRef,
  LayoutDump,
  PackageInfo,
  StructInfo,
  StructRef,
} from "./LayoutDumpSchema";

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

  generateClass(aPackage: PackageInfo, aClass: ClassInfo) {
    const name = `${aPackage.packageName}/${aClass.className}`;
    const flag = this.generators.get(name);
    if (flag === false) {
      console.warn(`Circular dependency detected for ${name}, skipping generation.`);
      return;
    }
    if (flag === true) {
      // Already generated, skip
      return;
    }

    this.generators.set(name, false);
    new TSFileGenerator(this, aPackage.packageName, aClass.className).generateClass(aClass);
    this.generators.set(name, true);
  }

  generateStruct(aPackage: PackageInfo, aStruct: StructInfo) {
    const name = `${aPackage.packageName}/${aStruct.structName}`;
    const flag = this.generators.get(name);
    if (flag === false) {
      console.warn(`Circular dependency detected for ${name}, skipping generation.`);
      return;
    }
    if (flag === true) {
      // Already generated, skip
      return;
    }

    this.generators.set(name, false);
    new TSFileGenerator(this, aPackage.packageName, aStruct.structName).generateStruct(aStruct);
    this.generators.set(name, true);
  }
}

class TSFileGenerator {
  private imports: Map<string, string> = new Map();
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

  private importGeneric(aPackage: PackageInfo, fileName: string, symbolName: string): string {
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

  generateClass(aClass: ClassInfo) {
    let line = `export interface ${getClassName(aClass)}`;

    if (aClass.superClass) {
      line += ` extends ${this.resolveClassRef(aClass.superClass)}`;
    }

    line += ` {`;
    this.addLine(line);

    this.withIndent(() => {
      if (aClass.properties) {
        for (const prop of aClass.properties) {
          this.addLine(`${prop.name}: ${this.generateType(prop)};`);
        }
      }

      // UObject is a special case, add specific methods
      if (aClass.className === "Object") {
        this.addLine(`get outer(): UObject | null;`);
        this.addLine(`get innerObjects(): ReadonlyArray<UObject>;`);
      }
    });

    this.addLine(`}`);

    console.log(`Generating class: ${this.outputPath}`);
    writeFile(this.outputPath, this.composePage());
  }

  generateStruct(aStruct: StructInfo) {
    let line = `export interface ${getStructName(aStruct)}`;

    line += ` {`;
    this.addLine(line);

    this.withIndent(() => {
      if (aStruct.properties) {
        for (const prop of aStruct.properties) {
          this.addLine(`${prop.name}: ${this.generateType(prop)};`);
        }
      }
    });

    this.addLine(`}`);

    console.log(`Generating struct: ${this.outputPath}`);
    writeFile(this.outputPath, this.composePage());
  }

  generateType(property: ChildPropertyInfo): string {
    switch (property.type) {
      case "ByteProperty":
        if (property.enumType) {
          return `TODO__${property.enumType}`;
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
      case "WeakObjectProperty":
      case "LazyObjectProperty":
      case "SoftObjectProperty":
        return "Object";
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
        break;
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
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join("\n") + "\n", "utf-8");
}

main();
