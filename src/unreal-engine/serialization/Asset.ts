import "../modules/all-objects";

import invariant from "tiny-invariant";

import { removeExtension } from "../../utils/string-utils";
import { type AssetReader, FullAssetReader } from "../AssetReader";
import { UClass } from "../modules/CoreUObject/objects/Class";
import { ELoadingPhase, type ObjectResolver, UObject, WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import { type UPackage } from "../modules/CoreUObject/objects/Package";
import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { createMissingImportedObject, isMissingImportedObject } from "../modules/mock-object";
import { NAME_CoreUObject, NAME_Package } from "../modules/names";
import { makeNameFromParts } from "../path-utils";
import { findClassOf } from "../types/class-registry";
import { FName, NAME_None } from "../types/Name";
import { type IObjectContext, MakeObjectContext } from "../types/object-context";
import { EUnrealEngineObjectUE4Version } from "../versioning/ue-versions";

import { EObjectFlags, FObjectExport } from "./ObjectExport";
import { FObjectImport } from "./ObjectImport";
import { FPackageFileSummary } from "./PackageFileSummary";
import { SerializationStatistics } from "./SerializationStatistics";

const RecursiveCheck = Symbol("RecursiveCheck");

export interface AssetApi {
  get reader(): AssetReader;
  get mainObject(): UObject | null;
  get summary(): Readonly<FPackageFileSummary>;
  get exports(): ReadonlyArray<Readonly<FObjectExport>>;
  get imports(): ReadonlyArray<Readonly<FObjectImport>>;
  makeFullNameByIndex(index: number): string;
  getObjectName(index: number): FName;
  getObjectByIndex(index: number, full?: boolean): UObject;
  getByFullName(fullName: string): UObject;
  reloadAsset(): Promise<void>;
}

/**
 * Construct an asset from the given package name and reader.
 * The created asset retains a reference to the reader to lazily load objects when needed.
 * @param context The object context where to create the package and resolve external references.
 * @param packageName The name of the package.
 * @param dataView The data view containing the asset data.
 */
export function openAssetFromDataView(context: IObjectContext, packageName: string, dataView: DataView): AssetApi {
  console.log(removeExtension(packageName));
  return new Asset(context, FName.fromString(removeExtension(packageName)), new FullAssetReader(dataView));
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
  /** We have a dedicated context for this asset, in the future we may want to reuse it for other assets. */
  private readonly _context: IObjectContext;

  private readonly _packageName: FName;
  private readonly _reader: FullAssetReader;

  private readonly _summary: FPackageFileSummary;
  private readonly _imports: ReadonlyArray<FObjectImport>;
  private readonly _exports: ReadonlyArray<FObjectExport>;
  private readonly _softObjects: ReadonlyArray<FSoftObjectPath>;

  /// Cache of exported objects.
  private readonly _exportedObjects: Array<WeakObjectRef | symbol> = [];

  /// Cache of imported objects.
  private readonly _importedObjects: Array<WeakObjectRef> = [];

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
    this._package = this._context.findOrCreatePackage(packageName);
    this._package.assetApi = this;
  }

  get reader(): AssetReader {
    const assetReader = this._reader.clone();
    assetReader.seek(0);
    return assetReader;
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

    if (index < 0) {
      return this._imports[-index - 1].ObjectName;
    } else if (index > 0) {
      return this._exports[index - 1].ObjectName;
    } else {
      return NAME_None;
    }
  }

  /**
   * Retrieve the main object exported by this package, which is the export with the same
   * name as the package.
   */
  get mainObject() {
    const exportName = extractFileName(this._packageName.toString());
    const exportIndex = this.findRootExportByName(FName.fromString(exportName));
    return exportIndex ? this.getObjectByIndex(exportIndex) : null;
  }

  getObjectByIndex(index: number, full = true): UObject {
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);
    invariant(index != 0, `Expected a valid export index`);

    // First, check if we have it cached
    const currentObject = this.getCachedObjectByIndex(index);
    if (currentObject) {
      if (full && currentObject.loadingPhase === ELoadingPhase.None) {
        this.reloadObject(currentObject);
      }
      return currentObject;
    }

    // Load the object
    if (isExportIndex(index)) {
      return this.createExportObject(index, full);
    } else if (isImportIndex(index)) {
      return this.lookupImportObject(index);
    } else {
      // This should never happen, as we already check the index is not 0
      throw new Error(`Invalid index ${index}`);
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

  getByFullName(fullName: string) {
    const exportedObject = this.findIndexByFullName(fullName);
    if (exportedObject === -1) {
      throw new Error(`Object with full name ${fullName} not found`);
    }
    return this.getObjectByIndex(exportedObject + 1);
  }

  private findIndexByFullName(fullName: string) {
    return this._exports.findIndex(
      (_, index) => this.makeFullNameByIndex(index + 1).toLowerCase() === fullName.toLowerCase(),
    );
  }

  reloadObject(object: UObject) {
    const i = this._exportedObjects.findIndex((e) => e instanceof WeakObjectRef && e.deref() === object);
    if (i >= 0) {
      object.loadingPhase = ELoadingPhase.None;
      this.serializeObject(this._exports[i], object);
    }
  }

  /**
   * Retrieve the index of the export with the given name.
   * I found, returns the index of the export.
   * If not found, returns 0.
   */
  private findRootExportByName(exportName: FName) {
    const number = this._exports.findIndex((e) => e.OuterIndex == 0 && e.ObjectName.equals(exportName));
    return number + 1;
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
    invariant(isImportIndex(index), `Index ${index} must be an import index`);
    invariant(this.isIndexValid(index), `Invalid index ${index}`);
    return this._imports[-index - 1];
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
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);
    invariant(isExportIndex(index), `Index ${index} must be an export index`);

    const objectExport = this._exports[index - 1];

    const object = this.withRecursionCheck(index, () => {
      invariant(objectExport.ClassIndex != 0, `Expected a valid class index`);
      const clazz = this.getObjectByIndex(objectExport.ClassIndex, false) as UClass;

      // Get the outer object
      const outer = objectExport.OuterIndex ? this.getObjectByIndex(objectExport.OuterIndex, false) : this._package;
      if (isMissingImportedObject(clazz)) {
        console.warn(
          `Object ${objectExport.ObjectName} is based on an unknown class ${clazz.fullName}, using UObject as fallback`,
        );
        return new UObject({
          outer: outer,
          clazz: clazz,
          name: objectExport.ObjectName,
          flags: objectExport.objectFlags,
        });
      }

      return this._context.newObject(outer, clazz, objectExport.ObjectName, objectExport.objectFlags);
    });

    object.assetApi = this;

    // Register the object
    this._exportedObjects[index - 1] = object.asWeakObject();

    // serialize
    if (full && object.loadingPhase === ELoadingPhase.None) {
      this.serializeObject(objectExport, object);
    }

    return object;
  }

  private lookupImportObject(index: number): UObject {
    invariant(this.isIndexValid(index), `Invalid export index ${index}`);
    invariant(isImportIndex(index), `Index ${index} must be an export index`);

    const importObject = this.getObjectImport(index);

    const object = this.loadImportedObject(importObject);
    this._importedObjects[-index - 1] = object.asWeakObject();
    return object;
  }

  /**
   * At the moment, we don't load imported objects from other assets.
   * So, we create a fake object with the following rules:
   * - For packages, we create a package object (if not already existing in the context).
   * - For other objects, we create a child item of the outer, with the same name and class.
   */
  private loadImportedObject(importObject: FObjectImport): UObject {
    // Create a fallback object if the import is not found
    if (importObject.OuterIndex === 0) {
      // Root objects must be packages
      invariant(importObject.ClassPackage.equals(NAME_CoreUObject));
      invariant(importObject.ClassName.equals(NAME_Package));

      // Create the package object, without loading it from file.
      return this._context.findOrCreatePackage(importObject.ObjectName);
    }

    // Lookup for an existing child object with the same name and class
    const outer = this.getObjectByIndex(importObject.OuterIndex, false);

    // There is already an object with the same name, return it
    const existingChild = outer.findInnerByFName(importObject.ObjectName);
    if (existingChild) {
      return existingChild;
    }

    // Find or create the class
    const classPackage = this._context.findOrCreatePackage(importObject.ClassPackage);
    let classInstance = classPackage.findInnerByFName(importObject.ClassName);
    if (!classInstance) {
      classInstance = new UClass({
        outer: classPackage,
        clazz: this._context.CLASS_Class,
        name: importObject.ClassName,
        // We don't have this information for imported objects
        superClazz: this._context.CLASS_Class,
      });
    }
    invariant(classInstance instanceof UClass, `Expected a class for import ${importObject.ObjectName}`);

    console.log(`Creating missing ${classInstance.fullName}`);
    const isClass = classInstance == this._context.CLASS_Class;
    const fallbackClass = isClass ? UClass : UObject;
    const myClass = findClassOf(classInstance) ?? fallbackClass;
    return createMissingImportedObject(myClass, {
      outer: outer,
      clazz: classInstance,
      name: importObject.ObjectName,
    });
  }

  private serializeObject(objectExport: FObjectExport, object: UObject) {
    invariant(object.loadingPhase === ELoadingPhase.None, `Object ${object.fullName} already loaded`);

    try {
      // Mark as loaded, so that we can detect recursion
      object.loadingPhase = ELoadingPhase.Loading;

      this._reader.seek(objectExport.SerialOffset);
      const subReader = this._reader.subReader(objectExport.SerialSize);

      const resolver: ObjectResolver = {
        readObjectPtr: (reader: AssetReader) => {
          const index = reader.readInt32();
          return index ? this.getObjectByIndex(index, false) : null;
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

function extractFileName(packageName: string) {
  const baseName = removeExtension(packageName);
  const index = baseName.lastIndexOf("/");
  return index === -1 ? baseName : baseName.substring(index + 1);
}
