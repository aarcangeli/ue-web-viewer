export function removeInPlace<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): void {
  let index = 0;

  // Iterate until predicate returns false
  while (index < array.length && !predicate(array[index], index, array)) {
    index++;
  }

  // Iterate through the rest of the array
  for (let readIndex = index + 1; readIndex < array.length; readIndex++) {
    const item = array[readIndex];
    if (!predicate(item, readIndex, array)) {
      array[index] = item;
      index++;
    }
  }

  array.length = index;
}
