import type { IObjectContext } from "./types/object-context";
import type { IObjectLoader } from "./types/object-loader";
import type { VirtualFileSystem } from "./fileSystem/VirtualFileSystem";

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
