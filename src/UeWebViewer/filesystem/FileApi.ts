/**
 * Represents a file or directory in the file system.
 * This is implemented by the actual file system API, which depends on the
 * browser's file system API.
 */
export interface FileApi {
  kind: "file" | "directory";
  name: string;
  fullPath: string;
  parent: FileApi | null;
  isWritable: boolean;

  children(): Promise<FileApi[]>;

  /**
   * Convenient method to know if a directory is empty.
   * This is faster than calling `children()` and checking if the array is empty.
   */
  isEmptyDirectory(): boolean;

  read(): Promise<ArrayBuffer>;

  lastModifiedDate(): Promise<Date>;

  write(data: ArrayBuffer | string): Promise<void>;

  createFile(name: string): Promise<FileApi>;

  createDirectory(name: string): Promise<FileApi>;

  remove(): Promise<void>;
}
