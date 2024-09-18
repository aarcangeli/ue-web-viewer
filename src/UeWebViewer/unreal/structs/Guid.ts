import { AssetReader } from "../AssetReader";

/**
 * struct FGuid {
 *     uint32 A{};
 *     uint32 B{};
 *     uint32 C{};
 *     uint32 D{};
 * };
 */
export class FGuid {
  A: number = 0;
  B: number = 0;
  C: number = 0;
  D: number = 0;

  static fromComponents(A: number, B: number, C: number, D: number) {
    const result = new FGuid();
    result.A = A;
    result.B = B;
    result.C = C;
    result.D = D;
    return result;
  }

  static fromString(str: string) {
    const result = new FGuid();
    const match = str.match(/{([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})}/);
    if (!match) {
      throw new Error("Invalid GUID string");
    }
    result.A = parseInt(match[1], 16);
    result.B = ((parseInt(match[2], 16) << 16) | parseInt(match[3], 16)) >>> 0;
    result.C = ((parseInt(match[4], 16) << 16) | parseInt(match[5].substring(0, 4), 16)) >>> 0;
    result.D = parseInt(match[5].substring(4), 16);
    return result;
  }

  static fromStream(reader: AssetReader) {
    const result = new FGuid();
    result.A = reader.readUInt32();
    result.B = reader.readUInt32();
    result.C = reader.readUInt32();
    result.D = reader.readUInt32();
    return result;
  }

  get string() {
    return this.toString();
  }

  toString() {
    return `{${this.A.toString(16).padStart(8, "0")}-${(this.B >>> 16).toString(16).padStart(4, "0")}-${(
      this.B & 0xffff
    )
      .toString(16)
      .padStart(4, "0")}-${(this.C >>> 16).toString(16).padStart(4, "0")}-${(this.C & 0xffff)
      .toString(16)
      .padStart(4, "0")}${this.D.toString(16).padStart(8, "0")}}`;
  }
}
