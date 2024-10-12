import type { AssetReader } from "../../../AssetReader";
import { FVector3 } from "./Vector3";

/**
 * A pair of 3D vectors.
 */
export class FTwoVectors {
  V1: FVector3;
  V2: FVector3;

  constructor(V1: FVector3, V2: FVector3) {
    this.V1 = V1;
    this.V2 = V2;
  }

  static fromFloat(reader: AssetReader) {
    const V1 = FVector3.fromFloat(reader);
    const V2 = FVector3.fromFloat(reader);
    return new FTwoVectors(V1, V2);
  }

  static fromDouble(reader: AssetReader) {
    const V1 = FVector3.fromDouble(reader);
    const V2 = FVector3.fromDouble(reader);
    return new FTwoVectors(V1, V2);
  }

  toString() {
    return `FTwoVectors{V1: ${this.V1}, V2: ${this.V2}}`;
  }
}
