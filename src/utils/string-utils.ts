export function removePrefix(value: string, prefix: string, caseInsensitive = false) {
  const startsWith = caseInsensitive ? value.toLowerCase().startsWith(prefix.toLowerCase()) : value.startsWith(prefix);
  if (startsWith) {
    return value.substring(prefix.length);
  }
  return value;
}

export function removeSuffix(value: string, suffix: string, caseInsensitive = false) {
  const endsWith = caseInsensitive ? value.toLowerCase().endsWith(suffix.toLowerCase()) : value.endsWith(suffix);
  if (endsWith) {
    return value.substring(0, value.length - suffix.length);
  }
  return value;
}

export function removeExtension(value: string) {
  const index = value.lastIndexOf(".");
  if (index !== -1) {
    return value.substring(0, index);
  }
  return value;
}
