import type { FName } from "./types/Name";

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
export function tryParseExportTextPath(
  path: string,
): [string, string] | undefined {
  const match = path.match(/^(\/.+)'(.*)'$/);
  if (match) {
    return [match[1], match[2]];
  }
}

export function isShortPackageName(name: string) {
  return !name.includes("/");
}
