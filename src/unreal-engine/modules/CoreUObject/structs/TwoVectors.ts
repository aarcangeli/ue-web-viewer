import type { AssetReader } from "../../../AssetReader";

import { FVector } from "./Vector3";

/**
 * A pair of 3D vectors.
 */
export class FTwoVectors {
  V1: FVector;
  V2: FVector;

  constructor(V1: FVector, V2: FVector) {
    this.V1 = V1;
    this.V2 = V2;
  }

  static fromFloat(reader: AssetReader) {
    const V1 = FVector.fromFloat(reader);
    const V2 = FVector.fromFloat(reader);
    return new FTwoVectors(V1, V2);
  }

  static fromDouble(reader: AssetReader) {
    const V1 = FVector.fromDouble(reader);
    const V2 = FVector.fromDouble(reader);
    return new FTwoVectors(V1, V2);
  }

  toString() {
    return `FTwoVectors{V1: ${this.V1}, V2: ${this.V2}}`;
  }
}
