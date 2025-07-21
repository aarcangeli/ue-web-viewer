import { UObject } from "../../CoreUObject/objects/Object";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { FSubsurfaceProfileStruct } from "../structs/SubsurfaceProfileStruct";

export class USubsurfaceProfile extends UObject {
  Settings: FSubsurfaceProfileStruct = new FSubsurfaceProfileStruct();
  Guid: FGuid = GUID_None;
}
