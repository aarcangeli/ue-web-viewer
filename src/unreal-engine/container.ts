import { type IObjectContext, MakeObjectContext } from "./types/object-context";
import { createObjectLoader, type IObjectLoader } from "./types/object-loader";
import { VirtualFileSystem } from "./fileSystem/VirtualFileSystem";

export class Container {
  readonly vfs: VirtualFileSystem;
  readonly context: IObjectContext;
  readonly objectLoader: IObjectLoader;

  constructor(vfs: VirtualFileSystem, context: IObjectContext, objectLoader: IObjectLoader) {
    this.vfs = vfs;
    this.context = context;
    this.objectLoader = objectLoader;
  }
}

export function createContainer(): Container {
  const vfs = new VirtualFileSystem();
  const context = MakeObjectContext();
  return new Container(vfs, context, createObjectLoader(vfs, context));
}
