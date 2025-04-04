import invariant from "tiny-invariant";

import { removeExtension } from "../../utils/string-utils";
import type { AssetReader, FullAssetReader } from "../AssetReader";
import type { UClass } from "../modules/CoreUObject/objects/Class";
import type { ObjectConstructionParams, ObjectResolver } from "../modules/CoreUObject/objects/Object";
import { ELoadingPhase, UObject, WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import { CLASS_Package, UnknownClass } from "../modules/global-instances";
import { makeNameFromParts } from "../path-utils";
import { FName, NAME_None } from "../types/Name";
import { EUnrealEngineObjectUE4Version } from "../versioning/ue-versions";

import { EObjectFlags, FObjectExport } from "./ObjectExport";
import { FObjectImport } from "./ObjectImport";
import { FPackageFileSummary } from "./PackageFileSummary";
import { SerializationStatistics } from "./SerializationStatistics";

/**
 * Mock object which represents an object imported from another package.
 */
class MissingImportedObject extends UObject {}

const RecursiveCheck = Symbol("RecursiveCheck");

/**
 * This class permits to load data from an asset file.
 * An asset is composed by a root file (uasset or uexp) and an optional uexp file.
 *
 * The first time an object is requested, it is loaded from the file and weakly cached.
 * All referenced objects are created empty, and are filled when requested.
 *
 * The root object is always an instance of {@link UPackage}.
 */
export class Asset {
  private readonly _packageName: string;
  private readonly _reader: FullAssetReader;

  readonly summary: Readonly<FPackageFileSummary> = new FPackageFileSummary();
  readonly imports: ReadonlyArray<FObjectImport> = [];
  readonly exports: ReadonlyArray<FObjectExport> = [];

  /// Cache of exported objects.
  private readonly _exportedObjects: Array<WeakObjectRef | symbol> = [];

  /// Cache of imported objects.
  private readonly _importedObjects: Array<WeakObjectRef> = [];

  /**
   * The package object.
   */
  readonly package: UPackage;

  /**
   * Construct an asset from the given package name and reader.
   * The created asset retains a reference to the reader to lazily load objects when needed.
   * @param packageName The name of the package.
   * @param reader The reader to read the package content.
   * @param _reload Quick & dirty way to reload the reader.
   */
  constructor(
    packageName: string,
    reader: FullAssetReader,
    private _reload: (() => Promise<FullAssetReader>) | null = null,
  ) {
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
    this.package = new UPackage({
      clazz: CLASS_Package,
      name: FName.fromString(packageName),
      flags: 0,
    });
  }

  makeFullNameByIndex(index: number): string {
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

    const currentObject = this.getCachedObjectByIndex(index);
    if (currentObject) {
      if (full && currentObject.loadingPhase === ELoadingPhase.None) {
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
      const object = new MissingImportedObject({
        clazz: UnknownClass,
        name: this.getObjectName(index),
        flags: 0,
      });
      this._importedObjects[-index - 1] = object.asWeakObject();
      const outerIndex = this.getOuterIndex(index);
      if (outerIndex != 0) {
        this.getObjectByIndex(outerIndex).addInner(object);
      }
      return object;
    }
  }

  async reloadAsset() {
    if (!this._reload) {
      throw new Error("Reloading is not supported");
    }

    const reader = await this._reload();
    return new Asset(this._packageName, reader, this._reload);
  }

  getByFullName(fullName: string) {
    const exportedObject = this.findIndexByFullName(fullName);
    if (exportedObject === -1) {
      throw new Error(`Object with full name ${fullName} not found`);
    }
    return this.getObjectByIndex(exportedObject + 1);
  }

  private findIndexByFullName(fullName: string) {
    return this.exports.findIndex(
      (e, index) => this.makeFullNameByIndex(index + 1).toLowerCase() === fullName.toLowerCase(),
    );
  }

  reloadObject(object: UObject) {
    const index =
      this._exportedObjects.findIndex((e) => {
        return e instanceof WeakObjectRef && e.deref() === object;
      }) + 1;
    if (index > 0) {
      object.loadingPhase = ELoadingPhase.None;
      this.serializeObject(this.exports[index - 1], object);
    }
  }

  /**
   * Retrieve the index of the export with the given name.
   * I found, returns the index of the export.
   * If not found, returns 0.
   */
  private findRootExportByName(exportName: string) {
    const number = this.exports.findIndex((e) => e.OuterIndex == 0 && e.ObjectName.text === exportName);
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

    let value: WeakObjectRef | symbol;
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
      throw new Error(`Recursive object reference`);
    }

    return (value as WeakObjectRef)?.deref() ?? null;
  }

  private createExportObject(index: number, full: boolean): UObject {
    invariant(index > 0, `Index ${index} must be an export index`);
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);

    const objectExport = this.exports[index - 1];

    const object = this.withRecursionCheck(index, () => {
      invariant(objectExport.ClassIndex != 0, `Expected a valid class index`);
      const clazz = this.getObjectByIndex(objectExport.ClassIndex, false) as UClass;
      const object = this.instantiateObject({
        clazz: clazz,
        name: objectExport.ObjectName,
        flags: objectExport.objectFlags,
      });

      // Attach the object to the outer
      const outer = objectExport.OuterIndex ? this.getObjectByIndex(objectExport.OuterIndex, false) : this.package;
      outer.addInner(object);

      // Register the object
      this._exportedObjects[index - 1] = object.asWeakObject();

      return object;
    });

    // serialize
    if (full && object.loadingPhase === ELoadingPhase.None) {
      this.serializeObject(objectExport, object);
    }

    return object;
  }

  private serializeObject(objectExport: FObjectExport, object: UObject) {
    invariant(object.loadingPhase === ELoadingPhase.None, `Object ${object.fullName} already loaded`);

    try {
      // Mark as loaded, so that we can detect recursion
      object.loadingPhase = ELoadingPhase.Loading;

      this._reader.seek(objectExport.SerialOffset);
      const subReader = this._reader.subReader(objectExport.SerialSize);

      const resolver: ObjectResolver = (reader) => {
        const index = reader.readInt32();
        return index ? this.getObjectByIndex(index, false) : null;
      };

      if (objectExport.objectFlags & EObjectFlags.RF_ClassDefaultObject) {
        object.deserializeDefaultObject(subReader, resolver);
      } else {
        object.deserialize(subReader, resolver);
      }

      object.serializationStatistics = new SerializationStatistics(subReader.remaining, null);
      object.loadingPhase = ELoadingPhase.Full;
    } catch (e) {
      console.warn(`Error deserializing object ${object.fullName}; the object is partially loaded:`, e);
      object.serializationStatistics = new SerializationStatistics(null, String(e));
      object.loadingPhase = ELoadingPhase.Error;
    }
  }

  private instantiateObject(params: ObjectConstructionParams) {
    // todo: this should return a different class based on the UClass
    return new UObject(params);
  }

  private withRecursionCheck(index: number, fn: () => UObject) {
    // recursion check
    this._exportedObjects[index - 1] = RecursiveCheck;

    try {
      const createdObject = fn();
      this._exportedObjects[index - 1] = createdObject.asWeakObject();
      return createdObject;
    } catch (e) {
      if (this._exportedObjects[index - 1] === RecursiveCheck) {
        delete this._exportedObjects[index - 1];
      }
      throw e;
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
