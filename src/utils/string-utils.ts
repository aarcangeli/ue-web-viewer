export function removePrefix(value: string, prefix: string) {
  if (value.startsWith(prefix)) {
    return value.substring(prefix.length);
  }
  return value;
}
