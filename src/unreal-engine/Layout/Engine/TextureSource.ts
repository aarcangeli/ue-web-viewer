// This file is auto-generated, do not edit directly.

import type { ETextureSourceCompressionFormat } from "./ETextureSourceCompressionFormat";
import type { ETextureSourceFormat } from "./ETextureSourceFormat";
import type { FGuid } from "../CoreUObject/Guid";
import type { FTextureSourceBlock } from "./TextureSourceBlock";
import type { FTextureSourceLayerColorInfo } from "./TextureSourceLayerColorInfo";

export class FTextureSource {
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

  constructor(props: {
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
  }) {
    this.Id = props.Id;
    this.BaseBlockX = props.BaseBlockX;
    this.BaseBlockY = props.BaseBlockY;
    this.SizeX = props.SizeX;
    this.SizeY = props.SizeY;
    this.NumSlices = props.NumSlices;
    this.NumMips = props.NumMips;
    this.NumLayers = props.NumLayers;
    this.bPNGCompressed = props.bPNGCompressed;
    this.bLongLatCubemap = props.bLongLatCubemap;
    this.CompressionFormat = props.CompressionFormat;
    this.bGuidIsHash = props.bGuidIsHash;
    this.LayerColorInfo_LockProtected = props.LayerColorInfo_LockProtected;
    this.Format = props.Format;
    this.LayerFormat = props.LayerFormat;
    this.Blocks = props.Blocks;
    this.BlockDataOffsets = props.BlockDataOffsets;
  }
}
