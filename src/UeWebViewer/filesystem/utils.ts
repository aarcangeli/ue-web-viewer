import { FileApi } from "./FileApi";
import { fromHandle } from "./FileSystemHandleApi";

export async function getFilesFromItems(items: DataTransferItem[]): Promise<FileApi[]> {
  // Try to get the file handle
  let fileHandles = await Promise.all(
    items.map((item) => {
      return item.getAsFileSystemHandle && item.getAsFileSystemHandle();
    }),
  );
  fileHandles = fileHandles.filter((handle) => handle);
  if (fileHandles.length > 0) {
    return Promise.all(fileHandles.map((handle) => fromHandle(handle!)));
  }

  // todo: add support for FileSystemEntry if handle is not available
  // function traverseFileTree(item: FileSystemEntry, path: string = "") {
  //   path = path || "";
  //   if (item.isFile) {
  //     const file = item as FileSystemFileEntry;
  //     // Get file
  //     file.file(function (file) {
  //       console.log("File:", path + file.name);
  //     });
  //   } else if (item.isDirectory) {
  //     const directoryReader = item as FileSystemDirectoryEntry;
  //     const dirReader = directoryReader.createReader();
  //     dirReader.readEntries(function (entries) {
  //       for (const entry of entries) {
  //         traverseFileTree(entry, path + item.name + "/");
  //       }
  //     });
  //   }
  // }
  return [];
}
