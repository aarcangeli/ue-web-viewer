export function enumToFlags(
  enumValue: number,
  flags: Array<[string, number]>,
): string {
  const result: string[] = [];

  for (const [name, value] of flags) {
    if (enumValue & value) {
      result.push(name);
    }
  }

  return result.length ? result.join(" | ") : "None";
}
