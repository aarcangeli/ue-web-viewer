import { Container } from "./container";
import { VirtualFileSystem } from "./fileSystem/VirtualFileSystem";
import { MakeObjectContext } from "./types/object-context";
import { createObjectLoader } from "./types/object-loader";

export function createContainer(): Container {
  const vfs = new VirtualFileSystem();
  const context = MakeObjectContext();
  return new Container(vfs, context, createObjectLoader(vfs, context));
}
