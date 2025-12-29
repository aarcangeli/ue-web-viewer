import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";

export class FAnimSlotGroup {
  GroupName: FName = NAME_None;
  SlotNames: Array<FName> = [];
}
