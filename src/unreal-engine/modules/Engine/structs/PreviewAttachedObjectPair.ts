import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";
import type { UObject } from "../../CoreUObject/objects/Object";
import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";

export class FPreviewAttachedObjectPair {
  AttachedObject: FSoftObjectPath = new FSoftObjectPath();
  Object: UObject | null = null;
  AttachedTo: FName = NAME_None;
}
