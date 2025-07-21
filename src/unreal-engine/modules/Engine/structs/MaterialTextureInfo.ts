import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";
import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";

export class FMaterialTextureInfo {
  SamplingScale: number = 0;
  UVChannelIndex: number = 0;
  TextureName: FName = NAME_None;
  TextureReference: FSoftObjectPath = new FSoftObjectPath();
}
