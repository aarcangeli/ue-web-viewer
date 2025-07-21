import type { AssetReader } from "../../../AssetReader";

/**
 * Four-dimensional vector.
 * Can be integer or floating point.
 */
export class FVector4 {
  X: number = 0;
  Y: number = 0;
  Z: number = 0;
  W: number = 0;

  public constructor(X: number = 0, Y: number = 0, Z: number = 0, W: number = 0) {
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.W = W;
  }

  static fromFloat(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    const z = reader.readFloat();
    const w = reader.readFloat();
    return new FVector4(x, y, z, w);
  }

  static fromDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    const z = reader.readDouble();
    const w = reader.readDouble();
    return new FVector4(x, y, z, w);
  }

  static fromInt32(reader: AssetReader) {
    const x = reader.readInt32();
    const y = reader.readInt32();
    const z = reader.readInt32();
    const w = reader.readInt32();
    return new FVector4(x, y, z, w);
  }

  static fromInt64(reader: AssetReader) {
    const x = reader.readInt64();
    const y = reader.readInt64();
    const z = reader.readInt64();
    const w = reader.readInt64();
    return new FVector4(x, y, z, w);
  }

  static fromUInt32(reader: AssetReader) {
    const x = reader.readUInt32();
    const y = reader.readUInt32();
    const z = reader.readUInt32();
    const w = reader.readUInt32();
    return new FVector4(x, y, z, w);
  }

  static fromUInt64(reader: AssetReader) {
    const x = reader.readUInt64();
    const y = reader.readUInt64();
    const z = reader.readUInt64();
    const w = reader.readUInt64();
    return new FVector4(x, y, z, w);
  }

  toString() {
    return `FVector4{X: ${this.X}, Y: ${this.Y}, Z: ${this.Z}, W: ${this.W}}`;
  }
}
