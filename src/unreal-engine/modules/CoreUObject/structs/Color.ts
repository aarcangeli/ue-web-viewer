import type { AssetReader } from "../../../AssetReader";

/**
 * RGBA color on integer scale (sRGB).
 * LayoutGenerator: nosort
 */
export class FColor {
  R: number = 0;
  G: number = 0;
  B: number = 0;
  A: number = 0;

  constructor(R: number, G: number, B: number, A: number) {
    this.R = R;
    this.G = G;
    this.B = B;
    this.A = A;
  }

  static fromStream(reader: AssetReader) {
    const b = reader.readUInt8();
    const g = reader.readUInt8();
    const r = reader.readUInt8();
    const a = reader.readUInt8();
    return new FColor(r, g, b, a);
  }

  toString() {
    return `FColor(${this.R}, ${this.G}, ${this.B}, ${this.A})`;
  }
}
