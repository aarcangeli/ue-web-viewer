import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { type UObject, type WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import type { VirtualFileSystem } from "../fileSystem/VirtualFileSystem";
import type { FileApi } from "../fileSystem/FileApi";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import invariant from "tiny-invariant";
import { FName } from "./Name";
import { type AssetApi, openAssetFromDataView } from "../serialization/Asset";
import type { IObjectContext } from "./object-context";
import { isScriptPackage } from "../../utils/path-utils";

export interface IObjectLoader {
  loadObject(objectPath: FSoftObjectPath, abort: AbortSignal): Promise<UObject | null>;
  loadPackage(file: FileApi): Promise<UPackage | null>;
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

    if (isScriptPackage(objectPath.packageName.toString())) {
      return this.loadScriptObject(objectPath);
    }

    console.log("Loading object:", objectPath.toString());
    const packageStatus = this.getObjectStatus(new FSoftObjectPath(objectPath.packageName));

    // Find an existing package with the same name
    if (!packageStatus.asset) {
      const existingPackage = this.context.findPackage(objectPath.packageName);
      if (existingPackage) {
        if (!existingPackage.assetApi) {
          // Really strange, a package exists without an assetApi
          console.warn(`Package found without assetApi: ${objectPath.packageName.toString()}`);
          return null;
        }
        packageStatus.asset = existingPackage.assetApi;
      }
    }

    // Load from vfs
    if (!packageStatus.asset) {
      const resolvedFile = await this.vfs.resolveFile(objectPath.packageName.toString());
      console.log("Resolved file:", resolvedFile);
      if (resolvedFile) {
        await this.doLoadPackage(new FSoftObjectPath(objectPath.packageName), resolvedFile);
      }
    }

    if (!packageStatus.asset) {
      return null;
    }

    return packageStatus.asset.resolveObject(objectPath, abort);
  }

  private async doLoadPackageFromFile(softObjectPath: FSoftObjectPath, file: FileApi): Promise<AssetApi> {
    const content = await file.read();
    return openAssetFromDataView(this.context, softObjectPath.packageName, new DataView(content));
  }

  private loadScriptObject(objectPath: FSoftObjectPath) {
    // Get package
    const uPackage = this.context.findOrCreatePackage(objectPath.packageName);
    if (objectPath.assetName.isNone) {
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

  getObjectStatus(softObjectPath: FSoftObjectPath): ObjectStatus {
    const normalizedKey = softObjectPath.toString().toLowerCase();
    const status = this.cachedObjects.get(normalizedKey);
    if (status) {
      return status;
    }

    const newStatus = new ObjectStatus(softObjectPath);
    this.cachedObjects.set(normalizedKey, newStatus);
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
      if (status.asset == null && status.deref() === null) {
        status.close();
        this.cachedObjects.delete(key);
      }
    }
  }
}

class ObjectStatus {
  recursionCheck: boolean = false;
  readonly softObjectPath?: FSoftObjectPath;

  fileApi?: FileApi;
  weakRef?: WeakObjectRef | null;
  assetLoadPromise?: Promise<AssetApi>;

  // keep it strong?
  asset?: AssetApi;

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
