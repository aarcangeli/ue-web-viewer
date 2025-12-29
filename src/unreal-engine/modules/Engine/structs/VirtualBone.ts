import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";

export class FVirtualBone {
  SourceBoneName: FName = NAME_None;
  TargetBoneName: FName = NAME_None;
  VirtualBoneName: FName = NAME_None;
}
