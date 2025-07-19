// This file is auto-generated, do not edit directly.

import type { FPerQualityLevelInt } from "./PerQualityLevelInt";
import type { UObject } from "../CoreUObject/Object";

export interface UStreamableRenderAsset extends UObject {
  ForceMipLevelsToBeResidentTimestamp: number;
  NumCinematicMipLevels: number;
  NoRefStreamingLODBias: FPerQualityLevelInt;
  StreamingIndex: number;
  NeverStream: boolean;
  bGlobalForceMipLevelsToBeResident: boolean;
  bHasStreamingUpdatePending: boolean;
  bForceMiplevelsToBeResident: boolean;
  bIgnoreStreamingMipBias: boolean;
  bMarkAsEditorStreamingPool: boolean;
  bUseCinematicMipLevels: boolean;
}
