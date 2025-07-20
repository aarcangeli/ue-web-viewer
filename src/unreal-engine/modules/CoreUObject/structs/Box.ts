import type { AssetReader } from "../../../AssetReader";

import { FVector } from "./Vector3";

export class FBox {
  Min: FVector;
  Max: FVector;
  IsValid: boolean;

  constructor(Min: FVector, Max: FVector, IsValid: boolean) {
    this.Min = Min;
    this.Max = Max;
    this.IsValid = IsValid;
  }

  static fromFloat(reader: AssetReader) {
    const Min = FVector.fromFloat(reader);
    const Max = FVector.fromFloat(reader);
    const IsValid = reader.readUInt8() !== 0;
    return new FBox(Min, Max, IsValid);
  }

  static fromDouble(reader: AssetReader) {
    const Min = FVector.fromDouble(reader);
    const Max = FVector.fromDouble(reader);
    const IsValid = reader.readUInt8() !== 0;
    return new FBox(Min, Max, IsValid);
  }

  toString() {
    return `FRotator{Min: ${this.Min}, Max: ${this.Max}, IsValid: ${this.IsValid}}`;
  }
}
