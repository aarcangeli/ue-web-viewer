// This file is auto-generated, do not edit directly.

import { FRotator } from "../CoreUObject/Rotator";
import { FVector } from "../CoreUObject/Vector";
import { UObject } from "../CoreUObject/Object";
import type { UStaticMesh } from "./StaticMesh";

export class UStaticMeshSocket extends UObject {
  SocketName: string = "";
  RelativeLocation: FVector = new FVector();
  RelativeRotation: FRotator = new FRotator();
  RelativeScale: FVector = new FVector();
  Tag: string = "";
  PreviewStaticMesh: UStaticMesh | null = null;
  bSocketCreatedAtImport: boolean = false;
}
