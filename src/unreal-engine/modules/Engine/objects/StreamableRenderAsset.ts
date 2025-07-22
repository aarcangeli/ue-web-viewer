import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "../../CoreUObject/objects/Object";
import { FPerQualityLevelInt } from "../structs/PerQualityLevelInt";

@RegisterClass("/Script/Engine.StreamableRenderAsset")
export class UStreamableRenderAsset extends UObject {
  NumCinematicMipLevels: number = 0;
  NoRefStreamingLODBias: FPerQualityLevelInt = new FPerQualityLevelInt();
  NeverStream: boolean = false;
  bGlobalForceMipLevelsToBeResident: boolean = false;
}
