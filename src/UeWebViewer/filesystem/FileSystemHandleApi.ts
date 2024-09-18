import { FileApi } from "./FileApi";

export class FileHandleApi implements FileApi {
  kind = this.fileHandle.kind;
  isWritable = true;

  constructor(
    private fileHandle: FileSystemHandle,
    public parent: FileApi | null,
    public fullPath: string,
    private isEmptyDir: boolean,
  ) {}

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
    const file = await (this.fileHandle as FileSystemFileHandle).getFile();
    return file.arrayBuffer();
  }

  async write(data: ArrayBuffer | string): Promise<void> {
    if (this.fileHandle.kind === "directory") {
      throw new Error("Cannot write to a directory");
    }
    let fileHandle = this.fileHandle as FileSystemFileHandle;
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  async lastModifiedDate(): Promise<Date> {
    const file = await (this.fileHandle as FileSystemFileHandle).getFile();
    return new Date(file.lastModified);
  }

  async createFile(name: string): Promise<FileApi> {
    if (this.fileHandle.kind !== "directory") {
      throw new Error("Cannot create a file in a file");
    }
    const directoryHandle = this.fileHandle as FileSystemDirectoryHandle;
    const fileHandle = await directoryHandle.getFileHandle(name, {
      create: true,
    });
    return await fromHandle(fileHandle, this);
  }

  async createDirectory(name: string): Promise<FileApi> {
    if (this.fileHandle.kind !== "directory") {
      throw new Error("Cannot create a directory in a file");
    }
    const directoryHandle = this.fileHandle as FileSystemDirectoryHandle;
    const fileHandle = await directoryHandle.getDirectoryHandle(name, {
      create: true,
    });
    return await fromHandle(fileHandle, this);
  }

  async remove(): Promise<void> {
    if (this.parent === null) {
      throw new Error("Cannot remove the root directory");
    }
    const parentApi = this.parent as FileHandleApi;
    const directoryHandle = parentApi.fileHandle as FileSystemDirectoryHandle;
    await directoryHandle.removeEntry(this.name);
  }
}

export async function fromHandle(handle: FileSystemHandle, parent: FileApi | null = null): Promise<FileApi> {
  const fullPath = parent ? `${parent.fullPath}/${handle.name}` : handle.name;
  const isEmptyDir = handle.kind === "directory" && (await (handle as FileSystemDirectoryHandle).entries().next()).done;
  return new FileHandleApi(handle as FileSystemFileHandle, parent, fullPath, isEmptyDir || false);
}
