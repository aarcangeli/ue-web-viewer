import invariant from "tiny-invariant";

import { hexToArrayBuffer } from "../../utils/string-utils";
import type { AssetReader } from "../AssetReader";
import { FGuid } from "../modules/CoreUObject/structs/Guid";

// Represents a 20-byte hash
const hashLength = 20;
const defaultHash = "0000000000000000000000000000000000000000";
const regExp = /^[0-9a-f]+$/;

export class FIoHash {
  private readonly hash: string;

  constructor(hash?: string) {
    this.hash = hash ?? defaultHash;
    invariant(this.hash.length === hashLength * 2, `Invalid FIoHash`);
    invariant(regExp.test(this.hash), `Invalid FIoHash format`);
  }

  toString(): string {
    return this.hash;
  }

  static fromStream(reader: AssetReader) {
    return this.fromBytes(reader.readBytes(20));
  }

  static fromBytes(bytes: Uint8Array): FIoHash {
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return new FIoHash(hex);
  }

  static fromGuid(guid: FGuid) {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    view.setUint32(0, guid.A, true);
    view.setUint32(4, guid.B, true);
    view.setUint32(8, guid.C, true);
    view.setUint32(12, guid.D, true);
    return this.fromBytes(new Uint8Array(buffer));
  }

  equals(other: FIoHash): boolean {
    return this.hash === other.hash;
  }

  toGuid(): FGuid {
    invariant(this.hash !== defaultHash, "Cannot convert default hash to FGuid");
    const view = new DataView(hexToArrayBuffer(this.hash));
    const a = view.getUint32(0, true);
    const b = view.getUint32(4, true);
    const c = view.getUint32(8, true);
    const d = view.getUint32(12, true);
    return FGuid.fromComponents(a, b, c, d);
  }

  isNone(): boolean {
    return this.hash === defaultHash;
  }
}

export const HashNone = new FIoHash();
