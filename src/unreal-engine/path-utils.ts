/**
 * The logic of unreal is unnecessarily complicated.
 *
 * - The first part is a package.
 * - The second part is the object name and is separated by a '.'.
 * - The third part is a subject, and is separated by a ':'.
 * - Further parts are separated by '.'.
 */
export function makeNameFromParts(parts: any[]) {
  let result = "";
  parts.forEach((part, index) => {
    if (index > 0) {
      result += index == 2 ? ":" : ".";
    }
    result += part;
  });
  return result;
}
