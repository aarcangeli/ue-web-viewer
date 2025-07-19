// This file is auto-generated, do not edit directly.

import type { FRotator } from "../CoreUObject/Rotator";
import type { FVector } from "../CoreUObject/Vector";
import type { UObject } from "../CoreUObject/Object";
import type { UStaticMesh } from "./StaticMesh";

export interface UStaticMeshSocket extends UObject {
  SocketName: string;
  RelativeLocation: FVector;
  RelativeRotation: FRotator;
  RelativeScale: FVector;
  Tag: string;
  PreviewStaticMesh: UStaticMesh;
  bSocketCreatedAtImport: boolean;
}
