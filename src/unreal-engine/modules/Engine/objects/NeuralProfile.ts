import { UObject } from "../../CoreUObject/objects/Object";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { FNeuralProfileStruct } from "../structs/NeuralProfileStruct";

export class UNeuralProfile extends UObject {
  Settings: FNeuralProfileStruct = new FNeuralProfileStruct();
  Guid: FGuid = GUID_None;
}
