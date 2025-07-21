import { FIntPoint } from "../../CoreUObject/structs/IntPoint";
import { TextureAddress } from "../enums/TextureAddress";

import { UTexture } from "./Texture";

export class UTexture2D extends UTexture {
  FirstResourceMemMip: number = 0;
  bHasBeenPaintedInEditor: boolean = false;
  AddressX: TextureAddress = TextureAddress.TA_Wrap;
  AddressY: TextureAddress = TextureAddress.TA_Wrap;
  ImportedSize: FIntPoint = new FIntPoint();
  CPUCopyTexture: UTexture2D | null = null;
}
