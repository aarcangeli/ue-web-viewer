import { RegisterClass } from "../../../types/class-registry";
import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";
import { UObject } from "../../CoreUObject/objects/Object";
import { FRotator } from "../../CoreUObject/structs/Rotator";
import { FVector3 } from "../../CoreUObject/structs/Vector3";
import type { UStaticMesh } from "./StaticMesh";

@RegisterClass("/Script/Engine.StaticMeshSocket")
export class UStaticMeshSocket extends UObject {
  SocketName: FName = NAME_None;
  RelativeLocation: FVector3 = new FVector3();
  RelativeRotation: FRotator = new FRotator();
  RelativeScale: FVector3 = new FVector3();
  Tag: string = "";
  PreviewStaticMesh: UStaticMesh | null = null;
  bSocketCreatedAtImport: boolean = false;
}
