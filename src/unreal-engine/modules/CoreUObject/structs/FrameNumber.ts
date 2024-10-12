import type { AssetReader } from "../../../AssetReader";

export class FFrameNumber {
  Value: number = 0;

  constructor(Ticks: number) {
    this.Value = Ticks;
  }

  static fromStream(reader: AssetReader) {
    const value = reader.readInt32();
    return new FFrameNumber(value);
  }

  toString() {
    return this.Value.toString();
  }

  toJson() {
    return this.toString();
  }
}
