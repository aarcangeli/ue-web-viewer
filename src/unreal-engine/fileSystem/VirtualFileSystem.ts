import { type FileApi, findChildCaseInsensitive } from "./FileApi";
import invariant from "tiny-invariant";
import { removeExtension } from "../../utils/string-utils";
import { checkAborted } from "../../utils/async-compute";

const assetFiles = [".uasset", ".umap"];

async function resolvePath(file: FileApi, path: string) {
  for (const string of path.split("/")) {
    const child = await findChildCaseInsensitive(file, string);
    if (!child) {
      return null;
    }
    file = child;
  }

  return file;
}

export enum MountType {
  GameContent = "game",
  GamePluginContent = "game-plugin",
  EngineContent = "engine",
  EnginePluginContent = "engine-plugin",
}

type MountPoint = { mountPath: string; fileApi: FileApi; type: MountType };

/**
 * A virtual file system that maps virtual paths to actual file APIs.
 *
 * Functionalities:
 * - Mount directories to virtual paths (like /Game, /PluginName, /Game, etc.)
 * - Resolve files and directories based on virtual paths (e.g., /Game/Maps/Level1)
 */
export class VirtualFileSystem {
  private readonly _mountPoints: MountPoint[] = [];

  constructor() {
    console.log("VirtualFileSystem created");
  }

  mountDirectory(virtualPath: string, fileApi: FileApi, type: MountType) {
    checkValidVirtualPath(virtualPath);
    this._mountPoints.push({ mountPath: virtualPath, fileApi, type });
    this.sortMountPoints();
  }

  /**
   * Scan the game directory for content and plugin directories,
   * @param gameDir
   * @param aborted
   */
  async mapGameDirectory(gameDir: FileApi, aborted: AbortSignal) {
    const allMappings = await scanGameContentDirectories(gameDir, aborted);
    this.replaceMountPoints([MountType.GameContent, MountType.GamePluginContent], allMappings);
  }

  async resolveFile(virtualPath: string): Promise<FileApi | null> {
    checkValidVirtualPath(virtualPath);

    for (const { mountPath, fileApi } of this._mountPoints) {
      if (virtualPath.toLowerCase().startsWith(mountPath.toLowerCase())) {
        // Remove mount path and leading slashes
        const relativePath = virtualPath.slice(mountPath.length).replace(/^\/+/, "");
        if (!relativePath) {
          return null;
        }

        const directory =
          relativePath.indexOf("/") > 0
            ? await resolvePath(fileApi, relativePath.split("/").slice(0, -1).join("/"))
            : fileApi;
        if (!directory || directory.kind !== "directory") {
          return null;
        }

        const filename = relativePath.split("/").slice(-1);
        for (const ext of assetFiles) {
          const file = await resolvePath(directory, filename + ext);
          if (file) {
            return file;
          }
        }
      }
    }
    return null;
  }

  /**
   * Remove mount points of specified types and add new mappings.
   * This is done atomically to avoid inconsistent states.
   */
  private replaceMountPoints(idsToRemove: MountType[], newMappings: Array<MountPoint>) {
    for (const mapping of newMappings) {
      checkValidVirtualPath(mapping.mountPath);
    }

    this.removeByType(...idsToRemove);
    this._mountPoints.push(...newMappings);
    this.sortMountPoints();
  }

  private removeByType(...idsToRemove: MountType[]) {
    removeInPlace(this._mountPoints, (mountPoint) => idsToRemove.includes(mountPoint.type));
  }

  private sortMountPoints() {
    this._mountPoints.sort((a, b) => b.mountPath.toLowerCase().localeCompare(a.mountPath.toLowerCase()));
  }
}

function isValidVirtualPath(path: string) {
  return path.startsWith("/") && path.indexOf(".") < 0;
}

function checkValidVirtualPath(path: string) {
  if (!isValidVirtualPath(path)) {
    throw new Error(`Invalid virtual path: ${path}`);
  }
}

async function scanGameContentDirectories(gameDir: FileApi, aborted: AbortSignal): Promise<Array<MountPoint>> {
  // Add the game's Content directory as /Game
  const allMappings: MountPoint[] = [];

  const dir = await findChildCaseInsensitive(gameDir, "Content");
  if (dir) {
    allMappings.push({ mountPath: "/Game", fileApi: dir, type: MountType.GameContent });
    checkAborted(aborted);
  }

  // Scan for plugin's Content directories
  const plugins = await findChildCaseInsensitive(gameDir, "Plugins");
  if (plugins) {
    for (const pluginFile of await scanPluginsDirectory(plugins)) {
      checkAborted(aborted);

      const pluginDir = pluginFile.parent;
      invariant(pluginDir);

      const contentDir = await findChildCaseInsensitive(pluginDir, "Content");
      if (contentDir) {
        const pluginId = removeExtension(pluginFile.name);
        allMappings.push({ mountPath: `/${pluginId}`, fileApi: contentDir, type: MountType.GamePluginContent });
      }
    }
  }

  return allMappings;
}

async function scanPluginsDirectory(pluginsDir: FileApi): Promise<FileApi[]> {
  const children = await pluginsDir.children();

  // Find plugins in this directory
  const inThisDir = children.filter((c) => c.kind === "file" && c.name.toLowerCase().endsWith(".uplugin"));
  if (inThisDir.length) {
    return inThisDir;
  }

  // if no plugins found, scan subdirectories
  const subDirs = children.filter((c) => c.kind === "directory");
  const results = await Promise.all(subDirs.map((d) => scanPluginsDirectory(d)));
  return results.flat();
}

function removeInPlace<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): void {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      array.splice(i, 1);
    }
  }
}
