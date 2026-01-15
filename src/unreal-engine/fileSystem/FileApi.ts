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

  children(): Promise<FileApi[]>;

  /**
   * Convenient method to know if a directory is empty.
   * This is faster than calling `children()` and checking if the array is empty.
   */
  isEmptyDirectory(): boolean;

  read(): Promise<ArrayBuffer>;

  lastModifiedDate(): Promise<Date>;
}

export async function findChildCaseInsensitive(file: FileApi, filename: string) {
  const children = await file.children();
  return children.find((child) => child.name.toLowerCase() === filename.toLowerCase());
}
