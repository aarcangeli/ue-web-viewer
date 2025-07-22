import { FIntPoint } from "../../CoreUObject/structs/IntPoint";
import { TextureAddress } from "../enums/TextureAddress";

import { RegisterClass } from "../../../types/class-registry";
import { UTexture } from "./Texture";

@RegisterClass("/Script/Engine.Texture2D")
export class UTexture2D extends UTexture {
  FirstResourceMemMip: number = 0;
  bHasBeenPaintedInEditor: boolean = false;
  AddressX: TextureAddress = TextureAddress.TA_Wrap;
  AddressY: TextureAddress = TextureAddress.TA_Wrap;
  ImportedSize: FIntPoint = new FIntPoint();
  CPUCopyTexture: UTexture2D | null = null;
}
