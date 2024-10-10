import type { AssetReader } from "../../AssetReader";

/**
 * Three-dimensional vector.
 * Can be integer or floating point.
 */
export class FVector3 {
  X: number = 0;
  Y: number = 0;
  Z: number = 0;

  public constructor(X: number, Y: number, Z: number) {
    this.X = X;
    this.Y = Y;
    this.Z = Z;
  }

  static fromFloat(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    const z = reader.readFloat();
    return new FVector3(x, y, z);
  }

  static fromDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    const z = reader.readDouble();
    return new FVector3(x, y, z);
  }

  static fromInt32(reader: AssetReader) {
    const x = reader.readInt32();
    const y = reader.readInt32();
    const z = reader.readInt32();
    return new FVector3(x, y, z);
  }

  static fromUint32(reader: AssetReader) {
    const x = reader.readUInt32();
    const y = reader.readUInt32();
    const z = reader.readUInt32();
    return new FVector3(x, y, z);
  }

  static fromInt64(reader: AssetReader) {
    const x = reader.readInt64();
    const y = reader.readInt64();
    const z = reader.readInt64();
    return new FVector3(x, y, z);
  }

  static fromUint64(reader: AssetReader) {
    const x = reader.readUInt64();
    const y = reader.readUInt64();
    const z = reader.readUInt64();
    return new FVector3(x, y, z);
  }

  toString() {
    return `FVector{X: ${this.X}, Y: ${this.Y}, Z: ${this.Z}}`;
  }
}
