import type { FileApi } from "./FileApi";

/**
 * File wrapper for the standard File API.
 * This api doesn't support directory operations and is read-only.
 */
export class StandardFileApi implements FileApi {
  kind = "file" as const;
  isWritable = false;
  parent = null;
  name: string;
  fullPath: string;

  constructor(private file: File) {
    this.name = file.name;
    this.fullPath = file.name;
  }

  async children(): Promise<FileApi[]> {
    return [];
  }

  async read(): Promise<ArrayBuffer> {
    return await this.file.arrayBuffer();
  }

  async lastModifiedDate(): Promise<Date> {
    return new Date(this.file.lastModified);
  }

  async write(): Promise<void> {
    throw new Error("Read only");
  }

  async createFile(): Promise<FileApi> {
    throw new Error("Read only");
  }

  async createDirectory(): Promise<FileApi> {
    throw new Error("Read only");
  }

  async remove(): Promise<void> {
    throw new Error("Read only");
  }

  isEmptyDirectory(): boolean {
    return false;
  }
}
