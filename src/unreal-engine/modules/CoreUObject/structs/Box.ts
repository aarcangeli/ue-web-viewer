import type { AssetReader } from "../../../AssetReader";

import { FVector3 } from "./Vector3";

export class FBox {
  Min: FVector3 = new FVector3();
  Max: FVector3 = new FVector3();
  IsValid: boolean = false;

  static fromData(min: FVector3, max: FVector3, isValid: boolean) {
    const box = new FBox();
    box.Min = min;
    box.Max = max;
    box.IsValid = isValid;
    return box;
  }

  static fromFloat(reader: AssetReader) {
    const Min = FVector3.fromFloat(reader);
    const Max = FVector3.fromFloat(reader);
    const IsValid = reader.readUInt8() !== 0;
    return this.fromData(Min, Max, IsValid);
  }

  static fromDouble(reader: AssetReader) {
    const Min = FVector3.fromDouble(reader);
    const Max = FVector3.fromDouble(reader);
    const IsValid = reader.readUInt8() !== 0;
    return this.fromData(Min, Max, IsValid);
  }

  toString() {
    return `FBox{Min: ${this.Min}, Max: ${this.Max}, IsValid: ${this.IsValid}}`;
  }
}
