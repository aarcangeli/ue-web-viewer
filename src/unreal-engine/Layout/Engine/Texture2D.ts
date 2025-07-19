// This file is auto-generated, do not edit directly.

import { FIntPoint } from "../CoreUObject/IntPoint";
import { TextureAddress } from "./TextureAddress";
import { UTexture } from "./Texture";

export class UTexture2D extends UTexture {
  FirstResourceMemMip: number = 0;
  bHasBeenPaintedInEditor: boolean = false;
  AddressX: TextureAddress = TextureAddress.TA_Wrap;
  AddressY: TextureAddress = TextureAddress.TA_Wrap;
  ImportedSize: FIntPoint = new FIntPoint();
  CPUCopyTexture: UTexture2D | null = null;
}
