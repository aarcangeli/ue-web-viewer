import invariant from "tiny-invariant";

/**
 * Split an array into 2 arrays based on a filter function.
 * @returns [trueValues, falseValues]
 */
export function partition<T>(array: T[], filter: (e: T, idx: number, arr: T[]) => boolean): [T[], T[]] {
  const trueValues: T[] = [];
  const falseValues: [] = [];
  array.forEach((e, idx, arr) => (filter(e, idx, arr) ? trueValues : falseValues).push(e));
  return [trueValues, falseValues];
}

/**
 * Split an array into multiple arrays based on a filter function.
 * @returns An array of arrays, where the index of the outer array corresponds to the return value of the filter function.
 */
export function multiPartition<T>(
  array: T[],
  size: number,
  filter: (e: T, idx: number, arr: T[]) => number,
): Array<T[]> {
  partition("asd");
  const result: Array<T[]> = Array.from({ length: size }, () => []);
  for (const e of array) {
    const idx = filter(e, array.indexOf(e), array);
    invariant(idx >= 0 && idx < size, `Invalid index ${idx}`);
    result[idx].push(e);
  }
  return result;
}
