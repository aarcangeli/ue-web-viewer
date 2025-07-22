import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "../../CoreUObject/objects/Object";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { FSpecularProfileStruct } from "../structs/SpecularProfileStruct";

@RegisterClass("/Script/Engine.SpecularProfile")
export class USpecularProfile extends UObject {
  Settings: FSpecularProfileStruct = new FSpecularProfileStruct();
  Guid: FGuid = GUID_None;
}
