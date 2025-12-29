import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";
import { EBoneTranslationRetargetingMode } from "../enums/EBoneTranslationRetargetingMode";

export class FBoneNode {
  Name: FName = NAME_None;
  ParentIndex: number = 0;
  TranslationRetargetingMode: EBoneTranslationRetargetingMode = EBoneTranslationRetargetingMode.Animation;
}
