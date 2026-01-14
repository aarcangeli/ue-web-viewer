import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { type UObject, type WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import { type VirtualFileSystem } from "../fileSystem/VirtualFileSystem";
import type { FileApi } from "../fileSystem/FileApi";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import invariant from "tiny-invariant";
import { FName } from "./Name";
import { type AssetApi, openAssetFromDataView } from "../serialization/Asset";
import type { IObjectContext } from "./object-context";
import { isScriptPackage } from "../../utils/path-utils";
import { checkAborted } from "../../utils/async-compute";

export interface IObjectLoader {
  loadObject(objectPath: FSoftObjectPath, abort: AbortSignal): Promise<UObject | null>;
  loadPackage(file: FileApi): Promise<UPackage | null>;
  getCached(softObjectPath: FSoftObjectPath): UObject | null;
  subscribeEvents<T extends UObject>(softObjectPath: FSoftObjectPath, listener: (value: T) => void): () => void;
}

export function createObjectLoader(vfs: VirtualFileSystem, context: IObjectContext): IObjectLoader {
  return new ObjectLoaderImpl(vfs, context);
}

class ObjectLoaderImpl implements IObjectLoader {
  private readonly vfs: VirtualFileSystem;
  private readonly context: IObjectContext;

  private readonly cachedObjects: Map<string, ObjectStatus> = new Map();

  constructor(vfs: VirtualFileSystem, context: IObjectContext) {
    this.vfs = vfs;
    this.context = context;
  }

  loadPackage(file: FileApi): Promise<UPackage | null> {
    invariant(file);
    if (file.kind !== "file") {
      return Promise.resolve(null);
    }

    this.removeGarbage();

    // Find a package with the same file
    const existingStatus = this.findFromFile(file);
    if (existingStatus) {
      const existingPackage = existingStatus.deref();
      if (existingPackage) {
        invariant(existingPackage instanceof UPackage, "Expected a UPackage");
        return Promise.resolve(existingPackage);
      }
    }

    // Find the virtual path of the file
    let virtualPath = this.vfs.findVirtualPath(file);
    if (!virtualPath) {
      // Find a unique name for the package
      const randomPart = Math.random().toString(36).slice(2, 10);
      virtualPath = `/Game/UnknownPackage_${randomPart}/${file.name}`;
    }

    const softObjectPath = FSoftObjectPath.fromNameParts([FName.fromString(virtualPath)]);
    return this.doLoadPackage(softObjectPath, file).then((asset) => asset.package);
  }

  getCached(softObjectPath: FSoftObjectPath): UObject | null {
    if (softObjectPath.isNull()) {
      return null;
    }

    // Check cache
    const status = this.getObjectStatus(softObjectPath);
    const existingObject = status.deref();
    if (existingObject) {
      return existingObject;
    }

    const lookupObject = this.lookupObject(softObjectPath);
    if (lookupObject) {
      this.setWithListener(status, lookupObject);
    }
    return lookupObject;
  }

  subscribeEvents<T extends UObject>(softObjectPath: FSoftObjectPath, listener: (value: T) => void): () => void {
    const objectStatus = this.getObjectStatus<T>(softObjectPath);
    objectStatus.listeners.add(listener);
    return () => objectStatus.listeners.delete(listener);
  }

  private async doLoadPackage(packagePath: FSoftObjectPath, file: FileApi): Promise<AssetApi> {
    invariant(packagePath.assetName.isNone);
    const status = this.getObjectStatus(packagePath);

    if (status.asset) {
      return status.asset;
    }
    if (status.assetLoadPromise) {
      return status.assetLoadPromise;
    }

    status.fileApi = file;

    const promise = this.doLoadPackageFromFile(packagePath, file);
    status.assetLoadPromise = promise;

    const asset = await promise;
    if (promise === status.assetLoadPromise) {
      status.assetLoadPromise = undefined;
    }

    return asset;
  }

  async loadObject(objectPath: FSoftObjectPath, abort: AbortSignal): Promise<UObject | null> {
    if (objectPath.isNull()) {
      return null;
    }

    const cachedValue = this.getCached(objectPath);
    if (cachedValue) {
      return cachedValue;
    }

    if (!isScriptPackage(objectPath.packageName.toString())) {
      const object = await this.doLoadObject(objectPath, abort);
      if (object) {
        this.setWithListener(this.getObjectStatus(objectPath), object);
      }
      return object;
    }

    return null;
  }

  private async doLoadObject(objectPath: FSoftObjectPath, abort: AbortSignal) {
    const asset = await this.loadPackageAsset(objectPath.packageName);
    checkAborted(abort);
    return asset ? await asset.resolveObject(objectPath, abort) : null;
  }

  private setWithListener(packageStatus: ObjectStatus, object: UObject) {
    const currentObject = packageStatus.deref();
    if (currentObject !== object) {
      packageStatus.weakRef = object.asWeakObject();
      for (const listener of packageStatus.listeners) {
        try {
          listener(object);
        } catch (e) {
          console.error("Error in object load listener", e);
        }
      }
    }
  }

  private async doLoadPackageFromFile(softObjectPath: FSoftObjectPath, file: FileApi): Promise<AssetApi> {
    const content = await file.read();
    return openAssetFromDataView(this.context, softObjectPath.packageName, new DataView(content));
  }

  private lookupObject(objectPath: FSoftObjectPath) {
    // Get package
    const uPackage = this.context.findPackage(objectPath.packageName);
    if (!uPackage || objectPath.assetName.isNone) {
      return uPackage;
    }

    let current = uPackage.findInnerByFName(objectPath.assetName);
    if (!objectPath.subPathString || !current) {
      return current;
    }

    for (const path of objectPath.subPathString) {
      current = current.findInnerByFName(FName.fromString(path));
      if (!current) {
        return null;
      }
    }

    return current;
  }

  getObjectStatus<T extends UObject>(softObjectPath: FSoftObjectPath): ObjectStatus<T> {
    const normalizedKey = softObjectPath.toString().toLowerCase();
    const status = this.cachedObjects.get(normalizedKey);
    if (status) {
      return status;
    }

    const newStatus = new ObjectStatus<T>(softObjectPath);
    this.cachedObjects.set(normalizedKey, newStatus as ObjectStatus);
    return newStatus;
  }

  findFromFile(file: FileApi): ObjectStatus | null {
    for (const status of this.cachedObjects.values()) {
      if (status.fileApi === file) {
        return status;
      }
    }
    return null;
  }

  removeGarbage() {
    for (const [key, status] of this.cachedObjects.entries()) {
      if (status.asset == null && status.deref() === null && status.listeners.size === 0) {
        status.close();
        this.cachedObjects.delete(key);
      }
    }
  }

  private async loadPackageAsset(packageName: FName): Promise<AssetApi | null> {
    const status = this.getObjectStatus(new FSoftObjectPath(packageName));
    if (status.asset) {
      return status.asset;
    }

    // Find an existing package with the same name
    const existingPackage = this.context.findPackage(packageName);
    if (existingPackage?.assetApi) {
      status.asset = existingPackage.assetApi;
      return status.asset;
    }

    // Load from vfs
    const resolvedFile = await this.vfs.resolveFile(packageName.toString());
    if (resolvedFile) {
      status.asset = await this.doLoadPackage(new FSoftObjectPath(packageName), resolvedFile);
      return status.asset;
    }

    return null;
  }
}

class ObjectStatus<T extends UObject = UObject> {
  recursionCheck: boolean = false;
  readonly softObjectPath?: FSoftObjectPath;

  fileApi?: FileApi;
  weakRef?: WeakObjectRef | null;
  assetLoadPromise?: Promise<AssetApi>;

  // keep it strong?
  asset?: AssetApi;

  // listeners to notify when the object is loaded
  listeners: Set<(value: T) => void> = new Set();

  constructor(softObjectPath: FSoftObjectPath) {
    this.softObjectPath = softObjectPath;
  }

  deref(): UObject | null {
    return this.weakRef?.deref() ?? null;
  }

  close() {
    this.asset?.close();
  }
}
