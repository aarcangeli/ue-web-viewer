import type { AssetReader } from "../../../AssetReader";
import { FVector3 } from "./Vector3";

export class FBox {
  Min: FVector3;
  Max: FVector3;
  IsValid: boolean;

  constructor(Min: FVector3, Max: FVector3, IsValid: boolean) {
    this.Min = Min;
    this.Max = Max;
    this.IsValid = IsValid;
  }

  static fromFloat(reader: AssetReader) {
    const Min = FVector3.fromFloat(reader);
    const Max = FVector3.fromFloat(reader);
    const IsValid = reader.readUInt8() !== 0;
    return new FBox(Min, Max, IsValid);
  }

  static fromDouble(reader: AssetReader) {
    const Min = FVector3.fromDouble(reader);
    const Max = FVector3.fromDouble(reader);
    const IsValid = reader.readUInt8() !== 0;
    return new FBox(Min, Max, IsValid);
  }

  toString() {
    return `FRotator{Min: ${this.Min}, Max: ${this.Max}, IsValid: ${this.IsValid}}`;
  }
}
