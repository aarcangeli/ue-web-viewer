import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { ETextureSourceCompressionFormat } from "../enums/ETextureSourceCompressionFormat";
import { ETextureSourceFormat } from "../enums/ETextureSourceFormat";
import type { FTextureSourceBlock } from "./TextureSourceBlock";
import type { FTextureSourceLayerColorInfo } from "./TextureSourceLayerColorInfo";

export class FTextureSource {
  Id: FGuid = GUID_None;
  BaseBlockX: number = 0;
  BaseBlockY: number = 0;
  SizeX: number = 0;
  SizeY: number = 0;
  NumSlices: number = 0;
  NumMips: number = 0;
  NumLayers: number = 0;
  bPNGCompressed: boolean = false;
  bLongLatCubemap: boolean = false;
  CompressionFormat: ETextureSourceCompressionFormat = ETextureSourceCompressionFormat.TSCF_None;
  bGuidIsHash: boolean = false;
  LayerColorInfo_LockProtected: Array<FTextureSourceLayerColorInfo> = [];
  Format: ETextureSourceFormat = ETextureSourceFormat.TSF_Invalid;
  LayerFormat: Array<ETextureSourceFormat> = [];
  Blocks: Array<FTextureSourceBlock> = [];
  BlockDataOffsets: Array<bigint> = [];
}
