import invariant from "tiny-invariant";

import { hexToArrayBuffer } from "../../../utils/string-utils";
import type { AssetReader } from "../../AssetReader";

// Represents a 20-byte hash
const hashLength = 32;

export class FBlake3Hash {
  private readonly hash: Uint8Array;

  constructor(hash?: Uint8Array) {
    this.hash = hash ?? new Uint8Array(hashLength);
    invariant(this.hash.length === hashLength, `Invalid FBlake3Hash`);
  }

  toString(): string {
    return this.toHex();
  }

  static fromStream(reader: AssetReader) {
    return this.fromBytes(reader.readBytes(hashLength));
  }

  static fromHex(hex: string): FBlake3Hash {
    if (hex.length !== hashLength * 2) {
      throw new Error("Invalid FBlake3Hash");
    }
    return new FBlake3Hash(hexToArrayBuffer(hex));
  }

  static fromBytes(bytes: Uint8Array): FBlake3Hash {
    invariant(bytes.length === hashLength, `Invalid FBlake3Hash length: ${bytes.length}`);
    return new FBlake3Hash(bytes);
  }

  toHex(): string {
    return [...this.hash].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  equals(other: FBlake3Hash): boolean {
    return this.hash.every((byte, index) => byte === other.hash[index]);
  }

  get isNone(): boolean {
    return this.hash.every((byte) => byte === 0);
  }
}

export const HashNone = new FBlake3Hash();
