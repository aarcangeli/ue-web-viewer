// This file is auto-generated, do not edit directly.

import type { ETextureSourceCompressionFormat } from "./ETextureSourceCompressionFormat";
import type { ETextureSourceFormat } from "./ETextureSourceFormat";
import type { FGuid } from "../CoreUObject/Guid";
import type { FTextureSourceBlock } from "./TextureSourceBlock";
import type { FTextureSourceLayerColorInfo } from "./TextureSourceLayerColorInfo";

export interface FTextureSource {
  Id: FGuid;
  BaseBlockX: number;
  BaseBlockY: number;
  SizeX: number;
  SizeY: number;
  NumSlices: number;
  NumMips: number;
  NumLayers: number;
  bPNGCompressed: boolean;
  bLongLatCubemap: boolean;
  CompressionFormat: ETextureSourceCompressionFormat;
  bGuidIsHash: boolean;
  LayerColorInfo_LockProtected: Array<FTextureSourceLayerColorInfo>;
  Format: ETextureSourceFormat;
  LayerFormat: Array<ETextureSourceFormat>;
  Blocks: Array<FTextureSourceBlock>;
  BlockDataOffsets: Array<bigint>;
}
