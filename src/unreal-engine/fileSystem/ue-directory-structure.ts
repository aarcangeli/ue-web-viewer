import type { FileApi } from "./FileApi";

export async function scanPluginsDirectory(pluginsDir: FileApi): Promise<FileApi[]> {
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
