import type { AssetReader } from "../../../AssetReader";

import { FVector3 } from "./Vector3";

/**
 * A pair of 3D vectors.
 */
export class FTwoVectors {
  v1: FVector3 = new FVector3();
  v2: FVector3 = new FVector3();

  constructor(V1: FVector3 | undefined = undefined, V2: FVector3 | undefined = undefined) {
    this.v1 = V1 ?? new FVector3();
    this.v2 = V2 ?? new FVector3();
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
    return `FTwoVectors{V1: ${this.v1}, V2: ${this.v2}}`;
  }
}
