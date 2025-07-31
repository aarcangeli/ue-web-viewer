import invariant from "tiny-invariant";

import { hexToArrayBuffer } from "../../../utils/string-utils";
import type { AssetReader } from "../../AssetReader";
import { FGuid } from "../../modules/CoreUObject/structs/Guid";

// Represents a 20-byte hash
const hashLength = 20;

export class FIoHash {
  private readonly hash: Uint8Array;

  constructor(hash?: Uint8Array) {
    this.hash = hash ?? new Uint8Array(hashLength);
    invariant(this.hash.length === hashLength, `Invalid FIoHash`);
  }

  toString(): string {
    return this.toHex();
  }

  static fromStream(reader: AssetReader) {
    return this.fromBytes(reader.readBytes(hashLength));
  }

  static fromHex(hex: string): FIoHash {
    if (hex.length !== hashLength * 2) {
      throw new Error("Invalid FIoHash");
    }
    return new FIoHash(hexToArrayBuffer(hex));
  }

  static fromBytes(bytes: Uint8Array): FIoHash {
    invariant(bytes.length === hashLength, `Invalid FIoHash length: ${bytes.length}`);
    return new FIoHash(bytes);
  }

  /**
   * Converts a FGuid to an FIoHash (little-endian).
   */
  static fromGuid(guid: FGuid) {
    const buffer = new Uint8Array(hashLength);
    const view = new DataView(buffer.buffer);
    view.setUint32(0, guid.A, true);
    view.setUint32(4, guid.B, true);
    view.setUint32(8, guid.C, true);
    view.setUint32(12, guid.D, true);
    return this.fromBytes(buffer);
  }

  /**
   * Converts a FIoHash to a FGuid (little-endian).
   */
  toGuid(): FGuid {
    invariant(!this.isNone, "Cannot convert default hash to FGuid");
    const view = new DataView(this.hash.buffer);
    const a = view.getUint32(0, true);
    const b = view.getUint32(4, true);
    const c = view.getUint32(8, true);
    const d = view.getUint32(12, true);
    return FGuid.fromComponents(a, b, c, d);
  }

  toHex(): string {
    return [...this.hash].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  equals(other: FIoHash): boolean {
    return this.hash.every((byte, index) => byte === other.hash[index]);
  }

  get isNone(): boolean {
    return this.hash.every((byte) => byte === 0);
  }

  toJSON() {
    return this.toString();
  }
}

export const HashNone = new FIoHash();
