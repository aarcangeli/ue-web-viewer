const NUM_REGEX = /^([0-9]|[1-9][0-9]*)$/;

export class FName {
  readonly name: string;
  readonly number: number; // u32

  constructor(name: string, number: number) {
    this.name = name;
    this.number = number;
  }

  static fromString(name: string): FName {
    const i = name.lastIndexOf("_");
    if (i >= 0 && NUM_REGEX.test(name.substring(i + 1))) {
      return new FName(name.substring(0, i), parseInt(name.substring(i + 1)) + 1);
    }
    return new FName(name, 0);
  }

  /**
   * Compares this name with another name.
   */
  equals(other: FName) {
    return this.number === other.number && this.name.toLowerCase() === other.name.toLowerCase();
  }

  startsWith(prefix: string) {
    return this.text.toLowerCase().startsWith(prefix.toLowerCase());
  }

  localeCompare(other: FName) {
    return this.text.localeCompare(other.text);
  }

  /**
   * Returns the string representation of this name.
   * Note: FNames are case-insensitive, do not use the string representation for comparison.
   */
  get text() {
    return this.name + (this.number != 0 ? `_${this.number - 1}` : "");
  }

  get isNone() {
    return this.name === "None" && this.number === 0;
  }

  /**
   * Alias for `text`.
   */
  toString() {
    return this.text;
  }

  /**
   * Alias for `text`.
   */
  toJSON() {
    return this.text;
  }
}

function getMapKey(key: FName) {
  return key.text.toLowerCase();
}

/**
 * A specialized map for FName keys.
 */
export class FNameMap<V> {
  private readonly _map = new Map<string, [FName, V]>();

  constructor(entries?: readonly (readonly [FName, V])[] | null) {
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  clear() {
    this._map.clear();
  }

  delete(key: FName): boolean {
    return this._map.delete(getMapKey(key));
  }

  forEach(fn: (value: V, key: FName, map: FNameMap<V>) => void, thisArg?: any) {
    this._map.forEach((value) => {
      fn.call(thisArg, value[1], value[0], this);
    });
  }

  get(key: FName): V | undefined {
    return this._map.get(getMapKey(key))?.[1];
  }

  has(key: FName): boolean {
    return this._map.has(getMapKey(key));
  }

  set(key: FName, value: V) {
    this._map.set(getMapKey(key), [key, value]);
  }

  get size() {
    return this._map.size;
  }
}

export const NAME_None = new FName("None", 0);
