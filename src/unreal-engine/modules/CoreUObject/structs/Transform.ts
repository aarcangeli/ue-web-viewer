import type { AssetReader } from "../../../AssetReader";

import { FQuat } from "./Quat";
import { FVector } from "./Vector3";

export class FTransform {
  Rotation: FQuat;
  Translation: FVector;
  Scale3D: FVector;

  constructor(Rotation: FQuat, Translation: FVector, Scale3D: FVector) {
    this.Rotation = Rotation;
    this.Translation = Translation;
    this.Scale3D = Scale3D;
  }

  static fromFloat(reader: AssetReader) {
    const Rotation = FQuat.fromFloat(reader);
    const Translation = FVector.fromFloat(reader);
    const Scale3D = FVector.fromFloat(reader);
    return new FTransform(Rotation, Translation, Scale3D);
  }

  static fromDouble(reader: AssetReader) {
    const Rotation = FQuat.fromDouble(reader);
    const Translation = FVector.fromDouble(reader);
    const Scale3D = FVector.fromDouble(reader);
    return new FTransform(Rotation, Translation, Scale3D);
  }

  toString() {
    return `FTransform{Rotation: ${this.Rotation}, Translation: ${this.Translation}, Scale3D: ${this.Scale3D}}`;
  }
}
