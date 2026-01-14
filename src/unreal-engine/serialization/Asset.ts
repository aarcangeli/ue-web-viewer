import "../modules/all-objects";

import invariant from "tiny-invariant";
import { type AssetReader, FullAssetReader } from "../AssetReader";
import { UClass } from "../modules/CoreUObject/objects/Class";
import { UObject } from "../modules/CoreUObject/objects/Object";
import { ELoadingPhase, type ObjectResolver, WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import { type UPackage } from "../modules/CoreUObject/objects/Package";
import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { makeNameFromParts } from "../../utils/path-utils";
import { type FName, NAME_None } from "../types/Name";
import { type IObjectContext } from "../types/object-context";
import { EUnrealEngineObjectUE4Version } from "../versioning/ue-versions";

import { EObjectFlags, FObjectExport } from "./ObjectExport";
import { FObjectImport } from "./ObjectImport";
import { FPackageFileSummary } from "./PackageFileSummary";
import { SerializationStatistics } from "./SerializationStatistics";
import { ObjectPtr } from "../modules/CoreUObject/structs/ObjectPtr";
import { checkAborted } from "../../utils/async-compute";

const RecursiveCheck = Symbol("RecursiveCheck");

/**
 * API to access a single Unreal Engine asset file (.uasset or .umap).
 */
export interface AssetApi {
  /** The context where the asset is loaded, and where external references are resolved. */
  get context(): IObjectContext;

  /** The reader to access the raw data of the asset. */
  get reader(): AssetReader;

  /** The name of the package represented by this asset. */
  get package(): UPackage;

  get summary(): Readonly<FPackageFileSummary>;
  get exports(): ReadonlyArray<Readonly<FObjectExport>>;
  get imports(): ReadonlyArray<Readonly<FObjectImport>>;

  makeFullNameByIndex(index: number): string;
  getObjectByIndex(index: number): ObjectPtr;
  getObjectByFullName(fullName: string): ObjectPtr;

  resolveObject(objectPath: FSoftObjectPath, abort: AbortSignal): Promise<UObject | null>;

  reloadAsset(): Promise<void>;

  close(): void;
}

/**
 * Construct an asset from the given package name and reader.
 * The created asset retains a reference to the reader to lazily load objects when needed.
 * @param context The object context where to create the package and resolve external references.
 * @param packageName The name of the package.
 * @param dataView The data view containing the asset data.
 */
export function openAssetFromDataView(context: IObjectContext, packageName: FName, dataView: DataView): AssetApi {
  return new Asset(context, packageName, new FullAssetReader(dataView));
}

/**
 * This class permits to load data from an asset file.
 * An asset is composed by a root file (uasset or umap) and an optional uexp file.
 *
 * The first time an object is requested, it is loaded from the file and weakly cached.
 * All referenced objects are created empty, and are filled when requested.
 *
 * The root object is always an instance of {@link UPackage}.
 */
class Asset implements AssetApi {
  private readonly _context: IObjectContext;

  private readonly _packageName: FName;
  private readonly _reader: FullAssetReader;

  private readonly _summary: FPackageFileSummary;
  private readonly _imports: ReadonlyArray<FObjectImport>;
  private readonly _exports: ReadonlyArray<FObjectExport>;
  private readonly _softObjects: ReadonlyArray<FSoftObjectPath>;

  /// Cache of exported objects.
  private readonly _exportedObjects: Array<WeakObjectRef | symbol> = [];

  /**
   * The root package loaded from this asset.
   */
  readonly _package: UPackage;

  constructor(context: IObjectContext, packageName: FName, reader: FullAssetReader) {
    invariant(packageName, "Expected a package name");
    invariant(reader.tell() === 0, "Expected to be at the beginning of the stream");

    this._context = context;
    this._packageName = packageName;
    this._reader = reader;

    // Read the package summary
    const summary = FPackageFileSummary.fromStream(reader);
    this._summary = summary;
    reader.setVersion(summary.FileVersionUE4, summary.FileVersionUE5);
    reader.setCustomVersions(summary.CustomVersionContainer);

    // read names, and set them in the reader so that can be used to read names from indexes
    reader.setNames(readNames(reader, summary));

    // Read other tables
    this._imports = readImportMap(reader, summary);
    this._exports = readExportMap(reader, summary);
    this._softObjects = readSoftObjectsMap(reader, summary);

    // Create the package object
    invariant(!this._context.findPackage(packageName), `Package ${packageName} already exists in the context`);
    this._package = this._context.findOrCreatePackage(packageName, summary.PackageFlags);
    this._package.assetApi = this;
  }

  get context(): IObjectContext {
    return this._context;
  }

  get reader(): AssetReader {
    const assetReader = this._reader.clone();
    assetReader.seek(0);
    return assetReader;
  }

  get package(): UPackage {
    return this._package;
  }

  get summary(): Readonly<FPackageFileSummary> {
    return this._summary;
  }

  get exports() {
    return this._exports;
  }

  get imports() {
    return this._imports;
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
    invariant(index !== 0, `Index 0 does not have a name`);

    if (index < 0) {
      return this._imports[-index - 1].ObjectName;
    } else {
      return this._exports[index - 1].ObjectName;
    }
  }

  private async resolveExportObjectByIndex(index: number, full: boolean, abort: AbortSignal): Promise<UObject | null> {
    invariant(index != 0, `Expected a valid export index`);
    invariant(isExportIndex(index), `Index ${index} must be an export index`);
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);

    // First, check if we have it cached
    let object = this.getCachedObjectByIndex(index);

    // If not, create it
    if (object === null) {
      // Load the object
      object = await this.doCreateExportObject(index, abort);
      if (object) {
        object.assetApi = this;
      }
    }

    if (full && object.loadingPhase === ELoadingPhase.None) {
      this.reloadObject(object);
    }

    return object;
  }

  getObjectByIndex(index: number): ObjectPtr {
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);

    if (index === 0) {
      // If index is 0, return a null ObjectPtr
      return ObjectPtr.makeNull();
    } else {
      // Create a soft object path from the name parts
      return ObjectPtr.fromSoftObjectPath(FSoftObjectPath.fromNameParts(this.getNameParts(index)));
    }
  }

  async reloadAsset(): Promise<void> {
    // if (!this._reload) {
    //   throw new Error("Reloading is not supported");
    // }
    //
    // const reader = await this._reload();
    // return new Asset(this._context, this._packageName, reader, this._reload);
    throw new Error("Reloading the entire asset is not supported");
  }

  close() {
    this.context.removePackage(this._package);
  }

  getObjectByFullName(fullName: string) {
    const exportedObject = this.findObjectIndexByFullName(fullName);
    if (exportedObject === 0) {
      throw new Error(`Object with full name ${fullName} not found`);
    }
    return this.getObjectByIndex(exportedObject);
  }

  async resolveObject(objectPath: FSoftObjectPath, abort: AbortSignal): Promise<UObject | null> {
    invariant(objectPath.packageName.equals(this._packageName), `Object ${objectPath} is from a different package`);

    const exportedObject = this.findObjectIndexByFullName(objectPath.toString());
    if (exportedObject === 0) {
      return null;
    }

    return this.resolveExportObjectByIndex(exportedObject, true, abort);
  }

  private findObjectIndexByFullName(fullName: string) {
    const arrayIndex = this._exports.findIndex(
      (_, index) => this.makeFullNameByIndex(index + 1).toLowerCase() === fullName.toLowerCase(),
    );
    // Not found (-1) became 0
    // Found index is incremented by 1 to convert to export index
    return arrayIndex + 1;
  }

  reloadObject(object: UObject) {
    const i = this._exportedObjects.findIndex((e) => e instanceof WeakObjectRef && e.deref() === object);
    if (i >= 0) {
      object.loadingPhase = ELoadingPhase.None;
      this.deserializeObject(this._exports[i], object);
    }
  }

  private isIndexValid(index: number) {
    return index >= -this._imports.length && index <= this._exports.length;
  }

  private getOuterIndex(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index < 0) {
      return this._imports[-index - 1].OuterIndex;
    } else if (index > 0) {
      return this._exports[index - 1].OuterIndex;
    } else {
      return 0;
    }
  }

  private getObjectImport(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);
    invariant(isImportIndex(index), `Index ${index} must be an import index`);
    return this._imports[-index - 1];
  }

  private getObjectExport(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);
    invariant(isExportIndex(index), `Expected export index for outer index`);
    return this._exports[index - 1];
  }

  /**
   * Retrieve the object at the given index, or null if not found or if the object has been garbage collected.
   */
  private getCachedObjectByIndex(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);
    invariant(!isImportIndex(index), `Invalid index ${index}`);

    let value: WeakObjectRef | symbol;
    if (index == 0) {
      return null;
    } else {
      value = this._exportedObjects[index - 1];
    }

    // The recursion can only happen when serializing outer or class.
    // If an object is referenced in properties, it will return a partially loaded object.
    if (value === RecursiveCheck) {
      throw new Error(`Recursive object reference`);
    }

    return (value as WeakObjectRef)?.deref() ?? null;
  }

  private doCreateExportObject(index: number, abort: AbortSignal): Promise<UObject> {
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);
    invariant(isExportIndex(index), `Index ${index} must be an export index`);

    return this.withRecursionCheck(index, async () => {
      const objectExport = this.getObjectExport(index);

      // Get outer object
      if (isImportIndex(objectExport.OuterIndex)) {
        throw new Error(`Exported object ${objectExport.ObjectName} has an imported outer, which is not supported`);
      }
      const outer = objectExport.OuterIndex
        ? await this.resolveExportObjectByIndex(objectExport.OuterIndex, false, abort)
        : this._package;
      invariant(outer); // Exported classes should always be created
      checkAborted(abort);

      // Get class object
      invariant(objectExport.ClassIndex != 0, `Expected a valid class index`);
      const classPtr = this.getObjectByIndex(objectExport.ClassIndex);

      // Recursively load the class, this is needed otherwise we cannot use the correct constructor
      const classObject = await classPtr.load(abort);
      if (!classObject || !(classObject instanceof UClass)) {
        // Without a full class, we don't know the correct hierarchy, and we cannot instantiate the correct JS class.
        console.warn(
          `Object ${objectExport.ObjectName} is based on an unknown class ${classPtr}, using UObject as fallback`,
        );
        return new UObject({
          outer,
          clazz: classPtr as unknown as ObjectPtr<UClass>,
          name: objectExport.ObjectName,
          flags: objectExport.objectFlags,
        });
      }

      return this._context.newObject(outer, classObject, objectExport.ObjectName, objectExport.objectFlags);
    });
  }

  private deserializeObject(objectExport: FObjectExport, object: UObject) {
    invariant(object.loadingPhase === ELoadingPhase.None, `Object ${object.fullName} already loaded`);

    try {
      // Mark as loaded, so that we can detect recursion
      object.loadingPhase = ELoadingPhase.Loading;

      this._reader.seek(objectExport.SerialOffset);
      const subReader = this._reader.subReader(objectExport.SerialSize);

      const resolver: ObjectResolver = {
        readObjectPtr: (reader: AssetReader) => {
          const index = reader.readInt32();
          return this.getObjectByIndex(index);
        },
        readSoftObjectPtr: (reader: AssetReader) => {
          if (this._softObjects.length) {
            const index = reader.readInt32();
            invariant(index >= 0 && index < this._softObjects.length, `Invalid soft object index ${index}`);
            return this._softObjects[index];
          } else {
            return FSoftObjectPath.fromStream(reader);
          }
        },
      };

      if (objectExport.objectFlags & EObjectFlags.RF_ClassDefaultObject) {
        object.deserializeDefaultObject(subReader, resolver);
      } else {
        object.deserialize(subReader, resolver);
      }

      object.serializationStatistics = new SerializationStatistics(subReader.getRemaining(), null);
      object.loadingPhase = ELoadingPhase.Full;
    } catch (e) {
      console.warn(`Error deserializing object ${object.fullName}; the object is partially loaded:`, e);
      object.serializationStatistics = new SerializationStatistics(null, String(e));
      object.loadingPhase = ELoadingPhase.Error;
    }
  }

  /**
   * Wrap the object creation with a recursion check.
   * If during the creation, the same object is requested, an error is thrown.
   */
  private async withRecursionCheck(index: number, fn: () => Promise<UObject>) {
    // recursion check
    this._exportedObjects[index - 1] = RecursiveCheck;

    try {
      const createdObject = await fn();
      this._exportedObjects[index - 1] = createdObject.asWeakObject();
      return createdObject;
    } catch (e) {
      if (this._exportedObjects[index - 1] === RecursiveCheck) {
        delete this._exportedObjects[index - 1];
      }
      throw e;
    }
  }

  private getNameParts(objectIndex: number) {
    const parts: FName[] = [];

    if (isImportIndex(objectIndex)) {
      while (objectIndex !== 0) {
        const importObject = this.getObjectImport(objectIndex);
        parts.push(importObject.ObjectName);
        objectIndex = importObject.OuterIndex;
      }
    } else {
      while (objectIndex !== 0) {
        const exportObject = this.getObjectExport(objectIndex);
        parts.push(exportObject.ObjectName);
        objectIndex = exportObject.OuterIndex;
      }
      // Export objects must begin with the package name
      parts.push(this._packageName);
    }

    return parts.reverse();
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

function readSoftObjectsMap(reader: AssetReader, summary: FPackageFileSummary) {
  if (!summary.SoftObjectPathsCount) {
    return [];
  }

  reader.seek(summary.SoftObjectPathsOffset);

  const softObjects = [];
  for (let i = 0; i < summary.SoftObjectPathsCount; i++) {
    const value = FSoftObjectPath.fromStream(reader);
    softObjects.push(value);
  }
  return softObjects;
}

function isExportIndex(index: number) {
  return index > 0;
}

function isImportIndex(index: number) {
  return index < 0;
}
