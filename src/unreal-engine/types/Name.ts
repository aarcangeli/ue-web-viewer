import invariant from "tiny-invariant";
const NUM_REGEX = /^([0-9]|[1-9][0-9]*)$/;

export class FName {
  readonly name: string;
  readonly number: number;

  constructor(name: string, number: number) {
    invariant(
      name.length >= 0 && name.length < 0x10000_0000,
      `Invalid number, must be a valid u32 value ${name.length}`,
    );
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
  equals(other: FName | string): boolean {
    if (typeof other === "string") {
      return this.text.toLowerCase() === other.toLowerCase();
    }
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

  get isEmpty() {
    return this.name.length === 0 && this.number === 0;
  }

  get isNone() {
    return this.equals(NAME_None);
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

  forEach(fn: (value: V, key: FName, map: FNameMap<V>) => void, thisArg?: unknown) {
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

  map<T>(callbackfn: (key: FName, value: V, index: number, map: FNameMap<V>) => T): T[] {
    const result: T[] = [];
    let index = 0;
    this._map.forEach((value) => {
      result.push(callbackfn(value[0], value[1], index++, this));
    });
    return result;
  }

  get size() {
    return this._map.size;
  }

  toJSON() {
    return this.map((key, value) => [key.toString(), value]);
  }
}

export const NAME_None = new FName("None", 0);
