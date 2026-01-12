export function removeInPlace<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): void {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      array.splice(i, 1);
    }
  }
}
