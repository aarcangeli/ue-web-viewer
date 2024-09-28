import { AssetReader } from "../AssetReader";

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

export const NAME_None = new FName("None", 0);
