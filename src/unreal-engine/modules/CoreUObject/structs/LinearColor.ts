import type { AssetReader } from "../../../AssetReader";

/**
 * RGBA color on floating point scale.
 */
export class FLinearColor {
  R: number = 0;
  G: number = 0;
  B: number = 0;
  A: number = 0;

  constructor(R: number = 0, G: number = 0, B: number = 0, A: number = 0) {
    this.R = R;
    this.G = G;
    this.B = B;
    this.A = A;
  }

  static fromStream(reader: AssetReader) {
    // The order in Unreal Engine is BGRA
    const g = reader.readFloat();
    const r = reader.readFloat();
    const b = reader.readFloat();
    const a = reader.readFloat();
    return new FLinearColor(r, g, b, a);
  }

  toString() {
    return `FLinearColor(${this.R}, ${this.G}, ${this.B}, ${this.A})`;
  }
}
