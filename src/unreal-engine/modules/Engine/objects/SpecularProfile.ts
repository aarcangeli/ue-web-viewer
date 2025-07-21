import { UObject } from "../../CoreUObject/objects/Object";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { FSpecularProfileStruct } from "../structs/SpecularProfileStruct";

export class USpecularProfile extends UObject {
  Settings: FSpecularProfileStruct = new FSpecularProfileStruct();
  Guid: FGuid = GUID_None;
}
