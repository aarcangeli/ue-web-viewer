import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { type UObject, type WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import type { VirtualFileSystem } from "../fileSystem/VirtualFileSystem";
import type { FileApi } from "../fileSystem/FileApi";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import invariant from "tiny-invariant";
import { FName } from "./Name";
import { type AssetApi, openAssetFromDataView } from "../serialization/Asset";
import type { IObjectContext } from "./object-context";

export interface IObjectLoader {
  loadObject(objectPath: FSoftObjectPath): Promise<UObject | null>;
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

  async loadPackage(file: FileApi): Promise<UPackage | null> {
    invariant(file);
    if (file.kind !== "file") {
      return Promise.resolve(null);
    }

    this.removeGarbage();

    // Step 1: find a package with the same file
    const existingStatus = this.findFromFile(file);
    if (existingStatus) {
      const existingPackage = existingStatus.deref();
      if (existingPackage) {
        invariant(existingPackage instanceof UPackage, "Expected a UPackage");
        return existingPackage;
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
    const status = this.getObjectStatus(softObjectPath);
    status.fileApi = file;

    if (!status.promise) {
      status.promise = this.doLoadPackageFromFile(status, softObjectPath, file);
    }

    const object = await status.promise;
    if (!(object instanceof UPackage)) {
      console.warn(`Loaded object is not a UPackage: path: ${softObjectPath} (${object})`);
      return null;
    }

    return object;

    // const virtualPath = container.vfs.findVirtualPath(file);
    // if (virtualPath) {
    //   const softObjectPath = FSoftObjectPath.fromNameParts([FName.fromString(virtualPath)]);
    //   const loadedObject = await container.objectLoader.loadObject(softObjectPath);
    //   console.log(softObjectPath);
    // }
    // const packageName = virtualPath ? virtualPath : `/Game/${file.name}`;
    // const content = await file.read();
    // return openAssetFromDataView(container.context, packageName, new DataView(content));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loadObject(objectPath: FSoftObjectPath): Promise<UPackage | null> {
    throw new Error("Method not implemented.");
  }

  private async doLoadPackageFromFile(
    status: ObjectStatus,
    softObjectPath: FSoftObjectPath,
    file: FileApi,
  ): Promise<UObject | null> {
    console.log("Loading package from file:", softObjectPath.toString());
    const content = await file.read();
    status.asset = openAssetFromDataView(this.context, softObjectPath.packageName, new DataView(content));
    return status.asset.package;
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
  promise?: Promise<UObject | null>;

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
