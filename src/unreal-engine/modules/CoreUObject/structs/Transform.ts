import type { AssetReader } from "../../../AssetReader";

import { FQuat } from "./Quat";
import { FVector3 } from "./Vector3";

export class FTransform {
  Translation: FVector3 = new FVector3();
  Rotation: FQuat = new FQuat();
  Scale3D: FVector3 = new FVector3();

  constructor(
    Translation: FVector3 = new FVector3(0, 0, 0),
    Rotation: FQuat = new FQuat(),
    Scale3D: FVector3 = new FVector3(1, 1, 1),
  ) {
    this.Translation = Translation;
    this.Rotation = Rotation;
    this.Scale3D = Scale3D;
  }

  static fromFloat(reader: AssetReader) {
    const Rotation = FQuat.fromFloat(reader);
    const Translation = FVector3.fromFloat(reader);
    const Scale3D = FVector3.fromFloat(reader);
    return new FTransform(Translation, Rotation, Scale3D);
  }

  static fromDouble(reader: AssetReader) {
    const Rotation = FQuat.fromDouble(reader);
    const Translation = FVector3.fromDouble(reader);
    const Scale3D = FVector3.fromDouble(reader);
    return new FTransform(Translation, Rotation, Scale3D);
  }

  static fromStream(reader: AssetReader) {
    if (reader.isLargeWorldCoordinates) {
      return FTransform.fromDouble(reader);
    } else {
      return FTransform.fromFloat(reader);
    }
  }

  get summary(): string {
    return (
      `T:{${this.Translation.X.toFixed(2)}, ${this.Translation.Y.toFixed(2)}, ${this.Translation.Z.toFixed(2)}} ` +
      `R:{${this.Rotation.X.toFixed(2)}, ${this.Rotation.Y.toFixed(2)}, ${this.Rotation.Z.toFixed(
        2,
      )}, ${this.Rotation.W.toFixed(2)}} ` +
      `S:{${this.Scale3D.X.toFixed(2)}, ${this.Scale3D.Y.toFixed(2)}, ${this.Scale3D.Z.toFixed(2)}}`
    );
  }

  toString() {
    return `FTransform{Rotation: ${this.Rotation}, Translation: ${this.Translation}, Scale3D: ${this.Scale3D}}`;
  }
}
