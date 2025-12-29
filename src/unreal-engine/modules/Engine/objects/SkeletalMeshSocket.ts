import { UObject } from "../../CoreUObject/objects/Object";
import { RegisterClass } from "../../../types/class-registry";
import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";
import { FVector3 } from "../../CoreUObject/structs/Vector3";
import { FRotator } from "../../CoreUObject/structs/Rotator";

@RegisterClass("/Script/Engine.SkeletalMeshSocket")
export class USkeletalMeshSocket extends UObject {
  SocketName: FName = NAME_None;
  BoneName: FName = NAME_None;
  RelativeLocation: FVector3 = new FVector3();
  RelativeRotation: FRotator = new FRotator();
  RelativeScale: FVector3 = new FVector3();
  bForceAlwaysAnimated: boolean = false;
}
