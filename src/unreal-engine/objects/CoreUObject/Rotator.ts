import type { AssetReader } from "../../AssetReader";

/**
 * struct FRotator {
 *    float Pitch{};
 *    float Yaw{};
 *    float Roll{};
 * };
 */
export class FRotator {
  readonly Pitch: number = 0;
  readonly Yaw: number = 0;
  readonly Roll: number = 0;

  private constructor(pitch: number, yaw: number, roll: number) {
    this.Pitch = pitch;
    this.Yaw = yaw;
    this.Roll = roll;
  }

  static fromComponents(pitch: number, yaw: number, roll: number) {
    return new FRotator(pitch, yaw, roll);
  }

  static fromFloat(reader: AssetReader) {
    const pitch = reader.readFloat();
    const yaw = reader.readFloat();
    const roll = reader.readFloat();
    return new FRotator(pitch, yaw, roll);
  }

  static fromDouble(reader: AssetReader) {
    const pitch = reader.readDouble();
    const yaw = reader.readDouble();
    const roll = reader.readDouble();
    return new FRotator(pitch, yaw, roll);
  }

  toString() {
    return `FRotator{R: ${this.Roll}, P: ${this.Pitch}, Y: ${this.Yaw}}`;
  }
}
