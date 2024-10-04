import { AssetReader } from "../../AssetReader";

export class FVector {
  X: number = 0;
  Y: number = 0;
  Z: number = 0;

  public constructor(X: number, Y: number, Z: number) {
    this.X = X;
    this.Y = Y;
    this.Z = Z;
  }

  static fromStream(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    const z = reader.readFloat();
    return new FVector(x, y, z);
  }

  static fromStreamDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    const z = reader.readDouble();
    return new FVector(x, y, z);
  }

  toString() {
    return `FVector{X: ${this.X}, Y: ${this.Y}, Z: ${this.Z}}`;
  }
}
