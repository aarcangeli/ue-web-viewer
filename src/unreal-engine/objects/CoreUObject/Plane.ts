import type { AssetReader } from "../../AssetReader";

export class FPlane {
  X: number = 0;
  Y: number = 0;
  Z: number = 0;
  W: number = 0;

  public constructor(X: number, Y: number, Z: number, W: number = 0) {
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.W = W;
  }

  static fromStream(reader: AssetReader) {
    const x = reader.readFloat();
    const y = reader.readFloat();
    const z = reader.readFloat();
    const w = reader.readFloat();
    return new FPlane(x, y, z, w);
  }

  static fromStreamDouble(reader: AssetReader) {
    const x = reader.readDouble();
    const y = reader.readDouble();
    const z = reader.readDouble();
    const w = reader.readDouble();
    return new FPlane(x, y, z, w);
  }

  toString() {
    return `FPlane{X: ${this.X}, Y: ${this.Y}, Z: ${this.Z}, W: ${this.W}}`;
  }
}
