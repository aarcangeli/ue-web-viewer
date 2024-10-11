import type { AssetReader } from "../../../AssetReader";

/**
 * Implements the difference between two {@link FDateTime} values.
 *
 * The only value stored in this brilliant struct is the time span in ticks (1 second = 10,000,000 ticks).
 * However, 1 month is not 30 days and 1 year is not 365 days.
 * Great job, Epic Games!
 */
export class FTimespan {
  Ticks: bigint = 0n;

  constructor(Ticks: bigint) {
    this.Ticks = Ticks;
  }

  static fromStream(reader: AssetReader) {
    const ticks = reader.readBigInt64();
    return new FTimespan(ticks);
  }

  toString() {
    return this.Ticks.toString();
  }

  toJson() {
    return this.toString();
  }
}
