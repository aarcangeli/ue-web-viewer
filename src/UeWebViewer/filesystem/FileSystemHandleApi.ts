import type { FileApi } from "../../unreal-engine/fileSystem/FileApi";
import { fakeWait } from "../config";

export class FileHandleApi implements FileApi {
  readonly kind: "file" | "directory";

  constructor(
    private fileHandle: FileSystemHandle,
    public parent: FileApi | null,
    public readonly fullPath: string,
    private isEmptyDir: boolean,
  ) {
    this.kind = this.fileHandle.kind;
  }

  isEmptyDirectory(): boolean {
    return this.isEmptyDir;
  }

  get name() {
    return this.fileHandle.name;
  }

  async children(): Promise<FileApi[]> {
    const result: FileApi[] = [];
    if (this.fileHandle.kind === "directory") {
      const directoryHandle = this.fileHandle as FileSystemDirectoryHandle;
      for await (const [, value] of directoryHandle.entries()) {
        result.push(await fromHandle(value, this));
      }
    }
    return result;
  }

  async read(): Promise<ArrayBuffer> {
    if (this.fileHandle.kind === "directory") {
      throw new Error("Cannot read a directory");
    }
    await fakeWait();
    const file = await (this.fileHandle as FileSystemFileHandle).getFile();
    return file.arrayBuffer();
  }

  async lastModifiedDate(): Promise<Date> {
    const file = await (this.fileHandle as FileSystemFileHandle).getFile();
    return new Date(file.lastModified);
  }
}

async function isEmptyDirectory(handle: FileSystemHandle): Promise<boolean> {
  if (handle.kind === "directory") {
    const iterator = await (handle as FileSystemDirectoryHandle).entries().next();
    return iterator.done === true;
  }
  return false;
}

export async function fromHandle(handle: FileSystemHandle, parent: FileApi | null = null): Promise<FileApi> {
  const fullPath = parent ? `${parent.fullPath}/${handle.name}` : handle.name;
  return new FileHandleApi(handle, parent, fullPath, await isEmptyDirectory(handle));
}
