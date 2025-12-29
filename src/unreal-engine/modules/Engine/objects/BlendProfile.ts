import { UObject } from "../../CoreUObject/objects/Object";
import { RegisterClass } from "../../../types/class-registry";
import type { USkeleton } from "./Skeleton";
import type { FBlendProfileBoneEntry } from "../structs/BlendProfileBoneEntry";
import { EBlendProfileMode } from "../enums/EBlendProfileMode";

@RegisterClass("/Script/Engine.BlendProfile")
export class UBlendProfile extends UObject {
  OwningSkeleton: USkeleton | null = null;
  ProfileEntries: Array<FBlendProfileBoneEntry> = [];
  Mode: EBlendProfileMode = EBlendProfileMode.TimeFactor;
}
