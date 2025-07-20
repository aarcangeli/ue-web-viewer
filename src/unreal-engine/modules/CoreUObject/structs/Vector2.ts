import type { AssetReader } from "../../../AssetReader";

/**
 * Two-dimensional vector.
 * Note: on Unreal this name is actually FVector2D
 */
export class FVector2 {
  X: number = 0;
  Y: number = 0;

  public constructor(X: number, Y: number) {
    this.X = X;
    this.Y = Y;
  }

  static fromFloat(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    return new FVector2(x, y);
  }

  static fromDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    return new FVector2(x, y);
  }

  static fromInt32(reader: AssetReader) {
    const x = reader.readInt32();
    const y = reader.readInt32();
    return new FVector2(x, y);
  }

  static fromInt64(reader: AssetReader) {
    const x = reader.readInt64();
    const y = reader.readInt64();
    return new FVector2(x, y);
  }

  static fromUInt32(reader: AssetReader) {
    const x = reader.readUInt32();
    const y = reader.readUInt32();
    return new FVector2(x, y);
  }

  static fromUInt64(reader: AssetReader) {
    const x = reader.readUInt64();
    const y = reader.readUInt64();
    return new FVector2(x, y);
  }

  toString() {
    return `FVector2{X: ${this.X}, Y: ${this.Y}}`;
  }
}
