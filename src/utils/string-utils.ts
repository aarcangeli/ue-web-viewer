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

export function startsWithCaseInsensitive(str: string, search: string) {
  return str.toLowerCase().startsWith(search.toLowerCase());
}

export function removeExtension(value: string) {
  const index = value.lastIndexOf(".");
  if (index !== -1) {
    return value.substring(0, index);
  }
  return value;
}

/**
 * Converts a hexadecimal string to an ArrayBuffer.
 *
 * @param {string} hex - The hexadecimal string to convert. Must have an even length.
 * @returns {ArrayBuffer} - The resulting ArrayBuffer containing the binary data.
 * @throws {Error} - Throws an error if the hex string has an odd length.
 *
 * @example
 * // Convert a hex string to an ArrayBuffer
 * const buffer = hexToArrayBuffer("48656c6c6f");
 * console.log(new TextDecoder().decode(buffer)); // Outputs: "Hello"
 */
export function hexToArrayBuffer(hex: string): Uint8Array {
  if (hex.length === 0) {
    return new Uint8Array(0);
  }
  if (hex.length % 2 !== 0) {
    throw new Error(`Hex string must have an even length, got ${hex.length}`);
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }

  const array = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return array;
}

export function toU32Hex(n: number) {
  return "0x" + (n >>> 0).toString(16).padStart(8, "0").toUpperCase();
}
