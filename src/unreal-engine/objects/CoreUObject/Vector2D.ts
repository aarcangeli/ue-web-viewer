import type { AssetReader } from "../../AssetReader";

/**
 * Two-dimensional vector.
 */
export class FVector2D {
  X: number = 0;
  Y: number = 0;

  public constructor(X: number, Y: number) {
    this.X = X;
    this.Y = Y;
  }

  static fromStream(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    return new FVector2D(x, y);
  }

  static fromStreamDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    return new FVector2D(x, y);
  }

  toString() {
    return `FVector2D{X: ${this.X}, Y: ${this.Y}}`;
  }
}
