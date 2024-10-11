import type { AssetReader } from "../../../AssetReader";

export class FDateTime {
  Ticks: bigint = 0n;

  constructor(Ticks: bigint) {
    this.Ticks = Ticks;
  }

  static fromStream(reader: AssetReader) {
    const ticks = reader.readBigInt64();
    return new FDateTime(ticks);
  }

  toString() {
    return this.Ticks.toString();
  }

  toJson() {
    return this.toString();
  }
}
