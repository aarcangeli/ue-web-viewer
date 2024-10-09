import type { AssetReader } from "../../AssetReader";
import { FQuat } from "./Quat";
import { FVector } from "./Vector";

export class FTransform {
  Rotation: FQuat;
  Translation: FVector;
  Scale3D: FVector;

  constructor(Rotation: FQuat, Translation: FVector, Scale3D: FVector) {
    this.Rotation = Rotation;
    this.Translation = Translation;
    this.Scale3D = Scale3D;
  }

  static fromStream(reader: AssetReader) {
    const Rotation = FQuat.fromStream(reader);
    const Translation = FVector.fromStream(reader);
    const Scale3D = FVector.fromStream(reader);
    return new FTransform(Rotation, Translation, Scale3D);
  }

  static fromStreamDouble(reader: AssetReader) {
    const Rotation = FQuat.fromStreamDouble(reader);
    const Translation = FVector.fromStreamDouble(reader);
    const Scale3D = FVector.fromStreamDouble(reader);
    return new FTransform(Rotation, Translation, Scale3D);
  }

  toString() {
    return `FTransform{Rotation: ${this.Rotation}, Translation: ${this.Translation}, Scale3D: ${this.Scale3D}}`;
  }
}
