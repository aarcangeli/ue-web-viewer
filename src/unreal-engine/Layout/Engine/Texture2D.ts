// This file is auto-generated, do not edit directly.

import type { FIntPoint } from "../CoreUObject/IntPoint";
import type { TextureAddress } from "./TextureAddress";
import type { UTexture } from "./Texture";

export interface UTexture2D extends UTexture {
  FirstResourceMemMip: number;
  bHasBeenPaintedInEditor: boolean; // Editor only property
  AddressX: TextureAddress;
  AddressY: TextureAddress;
  ImportedSize: FIntPoint;
  CPUCopyTexture: UTexture2D; // Editor only property
}
