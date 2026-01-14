import type { FName } from "../unreal-engine/types/Name";
import invariant from "tiny-invariant";
import { startsWithCaseInsensitive } from "./string-utils";

/**
 * The logic of unreal is unnecessarily complicated.
 *
 * - The first part is a package.
 * - The second part is the object name and is separated by a '.'.
 * - The third part is a subject, and is separated by a ':'.
 * - Further parts are separated by '.'.
 */
export function makeNameFromParts(parts: Array<string | FName>) {
  let result = "";
  parts.forEach((part, index) => {
    if (index > 0) {
      result += index == 2 ? ":" : ".";
    }
    result += part;
  });
  return result;
}

/**
 * Converts a string in the format "/Script/Engine.Blueprint'/Game/BP_Array.BP_Array'" to a pair of class path and object path.
 *
 * @See FPackageName::ParseExportTextPath.
 */
export function tryParseExportTextPath(path: string): [string, string] | undefined {
  const match = path.match(/^(\/.+)'(.*)'$/);
  if (match) {
    return [match[1], match[2]];
  }
}

export function isShortPackageName(name: string) {
  return !name.includes("/");
}

/**
 * Combines multiple path segments into a single path, ensuring there are no duplicate slashes.
 * Empty segments are ignored.
 * @example
 * combinePath("/Game/", "/Characters/", "Hero/") => "Game/Characters/Hero"
 * @note Leading and trailing slashes in each segment are removed.
 * @note Path segments cannot be '.' or '..'.
 */
export function combinePath(...paths: string[]): string {
  ensureValidCombinePaths(paths);

  return paths
    .map((p) => p.replace(/(^\/+|\/+$)/g, ""))
    .filter((p) => p.length > 0) // Remove empty segments
    .map((p) => p.trim()) // Trim whitespace
    .join("/");
}

function ensureValidCombinePaths(paths: unknown[]) {
  for (const path of paths) {
    invariant(typeof path === "string", "All arguments to combinePath must be strings");
    invariant(!path.includes("\\"), `Path segments must use forward slashes: ${path}`);
    invariant(path != "." && path != "..", `Path segments cannot be '.' or '..': ${path}`);
  }
}
export function isScriptPackage(exportedObjects: string) {
  return startsWithCaseInsensitive(exportedObjects, "/Script/");
}
