import { UObject } from "../../CoreUObject/objects/Object";
import { FPerQualityLevelInt } from "../structs/PerQualityLevelInt";

export class UStreamableRenderAsset extends UObject {
  NumCinematicMipLevels: number = 0;
  NoRefStreamingLODBias: FPerQualityLevelInt = new FPerQualityLevelInt();
  NeverStream: boolean = false;
  bGlobalForceMipLevelsToBeResident: boolean = false;
}
