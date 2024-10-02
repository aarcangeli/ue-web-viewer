import { AssetReader } from "../../AssetReader";

export enum EGuidFormats {
  /// Ex: {11223344-5566-7788-99AA-BBCCDDEEFF00}
  DigitsWithHyphensInBraces,
  /// Ex: 11223344-5566-7788-99aa-bbccddeeff00
  DigitsWithHyphensLower,
}

/**
 * struct FGuid {
 *     uint32 A{};
 *     uint32 B{};
 *     uint32 C{};
 *     uint32 D{};
 * };
 */
export class FGuid {
  readonly A: number = 0;
  readonly B: number = 0;
  readonly C: number = 0;
  readonly D: number = 0;

  private constructor(A: number, B: number, C: number, D: number) {
    this.A = A;
    this.B = B;
    this.C = C;
    this.D = D;
  }

  static fromComponents(A: number, B: number, C: number, D: number) {
    return new FGuid(A, B, C, D);
  }

  static fromString(str: string) {
    const match = str.match(/{([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})}/);
    if (!match) {
      throw new Error("Invalid GUID string");
    }
    const a = parseInt(match[1], 16);
    const b = ((parseInt(match[2], 16) << 16) | parseInt(match[3], 16)) >>> 0;
    const c = ((parseInt(match[4], 16) << 16) | parseInt(match[5].substring(0, 4), 16)) >>> 0;
    const d = parseInt(match[5].substring(4), 16);
    return new FGuid(a, b, c, d);
  }

  static fromStream(reader: AssetReader) {
    const a = reader.readUInt32();
    const b = reader.readUInt32();
    const c = reader.readUInt32();
    const d = reader.readUInt32();
    return new FGuid(a, b, c, d);
  }

  // Note: in unreal, the default format is DigitsWithHyphensLower
  toString(format: EGuidFormats = EGuidFormats.DigitsWithHyphensInBraces) {
    let block1 = this.A.toString(16).padStart(8, "0");
    let block2 = (this.B >>> 16).toString(16).padStart(4, "0");
    let block3 = (this.B & 0xffff).toString(16).padStart(4, "0");
    let block4 = (this.C >>> 16).toString(16).padStart(4, "0");
    let block5 = (this.C & 0xffff).toString(16).padStart(4, "0") + this.D.toString(16).padStart(8, "0");

    let string = `${block1}-${block2}-${block3}-${block4}-${block5}`;
    switch (format) {
      case EGuidFormats.DigitsWithHyphensInBraces:
        return `{${string}}`;
      case EGuidFormats.DigitsWithHyphensLower:
        return string;
    }
  }

  toJSON() {
    return this.toString(EGuidFormats.DigitsWithHyphensInBraces);
  }

  isValid() {
    return this.A !== 0 || this.B !== 0 || this.C !== 0 || this.D !== 0;
  }
}

export const GUID_None = FGuid.fromComponents(0, 0, 0, 0);
