import { AssetReader, FullAssetReader } from "./AssetReader";
import { FPackageFileSummary } from "./structs/PackageFileSummary";
import { FObjectImport } from "./structs/ObjectImport";
import { FObjectExport } from "./structs/ObjectExport";
import invariant from "tiny-invariant";
import { EUnrealEngineObjectUE4Version } from "./versioning/ue-versions";
import { FName, NAME_None } from "./structs/Name";
import { removeExtension } from "../utils/string-utils";
import { UObject, WeakObject } from "./objects/CoreUObject/Object";
import { UPackage } from "./objects/CoreUObject/Package";
import { CLASS_Package, UnknownClass } from "./objects/global-instances";
import { UClass } from "./objects/CoreUObject/Class";
import { SerializationStatistics } from "./structs/SerializationStatistics";

/**
 * Mock object which represents an object imported from another package.
 */
class MissingImportedObject extends UObject {}

const RecursiveCheck = Symbol("RecursiveCheck");

/**
 * The logic of unreal is unnecessarily complicated.
 *
 * - The first part is a package.
 * - The second part is the object name and is separated by a '.'.
 * - The third part is a subject, and is separated by a ':'.
 * - Further parts are separated by '.'.
 */
export function makeNameFromParts(parts: any[]) {
  let result = "";
  parts.forEach((part, index) => {
    if (index > 0) {
      result += index == 2 ? ":" : ".";
    }
    result += part;
  });
  return result;
}

/**
 * Permits to read the content of a package file.
 *
 * An asset is garbage collected only if all assets that contain it are garbage collected.
 */
export class Asset {
  private readonly _packageName: string;
  private readonly _reader: FullAssetReader;

  readonly summary: Readonly<FPackageFileSummary> = new FPackageFileSummary();
  readonly imports: ReadonlyArray<FObjectImport> = [];
  readonly exports: ReadonlyArray<FObjectExport> = [];

  /// Cache of exported objects.
  private readonly _exportedObjects: Array<WeakObject | Symbol> = [];

  /// Cache of imported objects.
  private readonly _importedObjects: Array<WeakObject> = [];

  /**
   * The package object.
   */
  private readonly _package: UPackage;

  private recursionCheck: string[] = [];

  /**
   * Construct an asset from the given package name and reader.
   * The created asset retains a reference to the reader to lazily load objects when needed.
   */
  constructor(packageName: string, reader: FullAssetReader) {
    invariant(packageName, "Expected a package name");
    invariant(reader.tell() === 0, "Expected to be at the beginning of the stream");

    // remove extension
    packageName = removeExtension(packageName);
    this._packageName = packageName;
    this._reader = reader;

    // Read the package summary
    reader.seek(0);
    const summary = FPackageFileSummary.fromStream(reader);
    this.summary = summary;
    reader.setVersion(summary.FileVersionUE4, summary.FileVersionUE5);

    // read names, and set them in the reader so that can be used to read names from indexes
    reader.setNames(readNames(reader, summary));

    // Read other tables
    this.imports = readImportMap(reader, summary);
    this.exports = readExportMap(reader, summary);

    // Create the package object
    this._package = new UPackage(CLASS_Package, FName.fromString(packageName));
  }

  makeFullName(index: number): string {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index == 0) {
      return "None";
    }

    const parts = [];

    const initialIndex = index;
    while (index !== 0) {
      parts.push(this.getObjectName(index));
      index = this.getOuterIndex(index);
    }

    // Exports must begin with the package name
    if (isExportIndex(initialIndex)) {
      parts.push(this._packageName);
    }
    return makeNameFromParts(parts.reverse());
  }

  getObjectName(index: number): FName {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index < 0) {
      return this.imports[-index - 1].ObjectName;
    } else if (index > 0) {
      return this.exports[index - 1].ObjectName;
    } else {
      return NAME_None;
    }
  }

  /**
   * Retrieve the main object exported by this package, which is the export with the same
   * name as the package.
   */
  get mainObject() {
    const exportName = extractFileName(this._packageName);
    let exportIndex = this.findRootExportByName(exportName);

    // If not found, try with the compiled version
    if (!exportIndex && !exportName.endsWith("_C")) {
      exportIndex = this.findRootExportByName(exportName + "_C");
    }

    return exportIndex ? this.getObjectByIndex(exportIndex) : null;
  }

  getObjectByIndex(index: number, full = true): UObject {
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);
    invariant(index != 0, `Expected a valid export index`);

    let currentObject = this.getCachedObjectByIndex(index);
    if (currentObject) {
      if (full && !currentObject.isFullyLoaded) {
        this.reloadObject(currentObject);
      }
      return currentObject;
    }

    // Load the object
    if (index > 0) {
      return this.createExportObject(index, full);
    } else {
      invariant(index < 0);
      // todo: import from another asset
      // For now, all imports are treated as missing objects
      let object = new MissingImportedObject(UnknownClass, this.getObjectName(index));
      this._importedObjects[-index - 1] = object.asWeakObject();
      console.log(`Imported object ${index}; parent: ${this.getOuterIndex(index)}`);
      const outerIndex = this.getOuterIndex(index);
      if (outerIndex != 0) {
        this.getObjectByIndex(outerIndex).addInner(object);
      }
      return object;
    }
  }

  reloadObject(object: UObject) {
    const index =
      this._exportedObjects.findIndex((e) => {
        return e instanceof WeakObject && e.deref() === object;
      }) + 1;
    if (index > 0) {
      this.serializeObject(this.exports[index - 1], object);
    }
  }

  /**
   * Retrieve the index of the export with the given name.
   * I found, returns the index of the export.
   * If not found, returns 0.
   */
  private findRootExportByName(exportName: string) {
    let number = this.exports.findIndex((e) => e.OuterIndex == 0 && e.ObjectName.text === exportName);
    return number + 1;
  }

  private isIndexValid(index: number) {
    return index >= -this.imports.length && index <= this.exports.length;
  }

  private getOuterIndex(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index < 0) {
      return this.imports[-index - 1].OuterIndex;
    } else if (index > 0) {
      return this.exports[index - 1].OuterIndex;
    } else {
      return 0;
    }
  }

  /**
   * Retrieve the object at the given index, or null if not found or if the object has been garbage collected.
   */
  private getCachedObjectByIndex(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    let value: WeakObject | Symbol;
    if (index == 0) {
      return null;
    } else if (index > 0) {
      value = this._exportedObjects[index - 1];
    } else {
      invariant(index < 0);
      value = this._importedObjects[-index - 1];
    }

    // The recursion can only happen when serializing outer or class.
    // If an object is referenced in properties, it will return a partially loaded object.
    if (value === RecursiveCheck) {
      throw new Error(`Recursive object reference detected: ${this.recursionCheck.join(" -> ")} -> ${index}`);
    }

    return (value as WeakObject)?.deref() ?? null;
  }

  private createExportObject(index: number, full: boolean): UObject {
    invariant(index > 0, `Index ${index} must be an export index`);
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);

    const objectExport = this.exports[index - 1];

    const object = this.withRecursionCheck(index, () => {
      invariant(objectExport.ClassIndex != 0, `Expected a valid class index`);
      const clazz = this.getObjectByIndex(objectExport.ClassIndex) as UClass;
      return this.instantiateObject(clazz, objectExport.ObjectName);
    });

    // Register the object immediately, so it can be referenced by other objects (even recursively)
    this._exportedObjects[index - 1] = object.asWeakObject();

    // Attach the object to the outer
    const outer = objectExport.OuterIndex ? this.getObjectByIndex(objectExport.OuterIndex) : this._package;
    outer.addInner(object);

    // serialize
    if (full) {
      this.serializeObject(objectExport, object);
    }

    return object;
  }

  private serializeObject(objectExport: FObjectExport, object: UObject) {
    try {
      console.log(`Reading object ${object.fullName}`);
      this._reader.seek(objectExport.SerialOffset);
      let subReader = this._reader.subReader(objectExport.SerialSize);
      object.deserialize(subReader, (reader) => {
        const index = reader.readInt32();
        return this.getObjectByIndex(index, false);
      });
      if (subReader.remaining > 0) {
        // console.warn(`Remaining bytes after reading object ${object.fullName}: ${subReader.remaining}`);
      }
      object.serializationStatistics = new SerializationStatistics(subReader.remaining, null);
    } catch (e) {
      console.warn(`Error deserializing object ${object.fullName}; the object is partially loaded:`, e);
      object.serializationStatistics = new SerializationStatistics(null, String(e));
    }
    console.log(`END Reading object ${object.fullName}`);
    object.isFullyLoaded = true;
  }

  private instantiateObject(clazz: UClass, name: FName) {
    // todo: this should return a different class based on the UClass
    return new UObject(clazz, name);
  }

  private withRecursionCheck<T>(index: number, fn: () => T) {
    // recursion check
    const oldLength = this.recursionCheck.length;
    this.recursionCheck.push(`${index}`);
    this._exportedObjects[index - 1] = RecursiveCheck;

    try {
      return fn();
    } catch (e) {
      if (this._exportedObjects[index - 1] === RecursiveCheck) {
        delete this._exportedObjects[index - 1];
      }
      throw e;
    } finally {
      this.recursionCheck.splice(oldLength);
    }
  }
}

function readNames(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.NameOffset);

  const names = [];
  for (let i = 0; i < summary.NameCount; i++) {
    names.push(reader.readString());

    // skip hash
    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_NAME_HASHES_SERIALIZED) {
      reader.readUInt32();
    }
  }
  return names;
}

function readImportMap(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.ImportOffset);

  const imports = [];
  for (let i = 0; i < summary.ImportCount; i++) {
    const value = FObjectImport.fromStream(reader);
    imports.push(value);
  }
  return imports;
}

function readExportMap(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.ExportOffset);

  const exports = [];
  for (let i = 0; i < summary.ExportCount; i++) {
    const value = FObjectExport.fromStream(reader);
    exports.push(value);
  }
  return exports;
}

function isExportIndex(index: number) {
  return index > 0;
}

function extractFileName(packageName: string) {
  const baseName = removeExtension(packageName);
  const index = baseName.lastIndexOf("/");
  return index === -1 ? baseName : baseName.substring(index + 1);
}
