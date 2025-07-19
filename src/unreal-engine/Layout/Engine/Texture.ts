// This file is auto-generated, do not edit directly.

import type { ECompositeTextureMode } from "./ECompositeTextureMode";
import type { ETextureAvailability } from "./ETextureAvailability";
import type { ETextureCompressionQuality } from "./ETextureCompressionQuality";
import type { ETextureDownscaleOptions } from "./ETextureDownscaleOptions";
import type { ETextureLossyCompressionAmount } from "./ETextureLossyCompressionAmount";
import type { ETextureMipLoadOptions } from "./ETextureMipLoadOptions";
import type { ETexturePowerOfTwoSetting } from "./ETexturePowerOfTwoSetting";
import type { EVTProducerPriority } from "../RenderCore/EVTProducerPriority";
import type { FColor } from "../CoreUObject/Color";
import type { FGuid } from "../CoreUObject/Guid";
import type { FPerPlatformFloat } from "../CoreUObject/PerPlatformFloat";
import type { FTextureFormatSettings } from "./TextureFormatSettings";
import type { FTextureSource } from "./TextureSource";
import type { FTextureSourceColorSettings } from "./TextureSourceColorSettings";
import type { FVector4 } from "../CoreUObject/Vector4";
import type { TextureCompressionSettings } from "./TextureCompressionSettings";
import type { TextureCookPlatformTilingSettings } from "./TextureCookPlatformTilingSettings";
import type { TextureFilter } from "./TextureFilter";
import type { TextureGroup } from "./TextureGroup";
import type { TextureMipGenSettings } from "./TextureMipGenSettings";
import type { UAssetImportData } from "./AssetImportData";
import type { UAssetUserData } from "./AssetUserData";
import type { UStreamableRenderAsset } from "./StreamableRenderAsset";

export interface UTexture extends UStreamableRenderAsset {
  Source: FTextureSource; // Editor only property
  LightingGuid: FGuid;
  SourceFilePath: string; // Editor only property
  AssetImportData: UAssetImportData; // Editor only property
  AdjustBrightness: number; // Editor only property
  AdjustBrightnessCurve: number; // Editor only property
  AdjustVibrance: number; // Editor only property
  AdjustSaturation: number; // Editor only property
  AdjustRGBCurve: number; // Editor only property
  AdjustHue: number; // Editor only property
  AdjustMinAlpha: number; // Editor only property
  AdjustMaxAlpha: number; // Editor only property
  CompressionNoAlpha: boolean; // Editor only property
  CompressionForceAlpha: boolean; // Editor only property
  CompressionNone: boolean; // Editor only property
  LossyCompressionAmount: ETextureLossyCompressionAmount; // Editor only property
  OodleTextureSdkVersion: string; // Editor only property
  MaxTextureSize: number; // Editor only property
  CompressionQuality: ETextureCompressionQuality; // Editor only property
  CompressionCacheId: FGuid; // Editor only property
  bDitherMipMapAlpha: boolean; // Editor only property
  bDoScaleMipsForAlphaCoverage: boolean; // Editor only property
  AlphaCoverageThresholds: FVector4; // Editor only property
  bUseNewMipFilter: boolean; // Editor only property
  bPreserveBorder: boolean; // Editor only property
  bFlipGreenChannel: boolean; // Editor only property
  PowerOfTwoMode: ETexturePowerOfTwoSetting; // Editor only property
  PaddingColor: FColor; // Editor only property
  bPadWithBorderColor: boolean; // Editor only property
  ResizeDuringBuildX: number; // Editor only property
  ResizeDuringBuildY: number; // Editor only property
  bChromaKeyTexture: boolean; // Editor only property
  ChromaKeyThreshold: number; // Editor only property
  ChromaKeyColor: FColor; // Editor only property
  MipGenSettings: TextureMipGenSettings; // Editor only property
  CompositeTexture: UTexture; // Editor only property
  CompositeTextureMode: ECompositeTextureMode; // Editor only property
  CompositePower: number; // Editor only property
  LayerFormatSettings: Array<FTextureFormatSettings>; // Editor only property
  LODBias: number;
  CompressionSettings: TextureCompressionSettings;
  Filter: TextureFilter;
  MipLoadOptions: ETextureMipLoadOptions;
  VirtualTextureStreamingPriority: EVTProducerPriority;
  VirtualTexturePrefetchMips: number;
  CookPlatformTilingSettings: TextureCookPlatformTilingSettings;
  bOodlePreserveExtremes: boolean;
  LODGroup: TextureGroup;
  Downscale: FPerPlatformFloat;
  DownscaleOptions: ETextureDownscaleOptions;
  Availability: ETextureAvailability;
  SRGB: boolean;
  bNormalizeNormals: boolean; // Editor only property
  bUseLegacyGamma: boolean; // Editor only property
  SourceColorSettings: FTextureSourceColorSettings; // Editor only property
  bNoTiling: boolean;
  VirtualTextureStreaming: boolean;
  bUseVirtualTextureStreamingPriority: boolean;
  CompressionYCoCg: boolean;
  AssetUserData: Array<UAssetUserData>;
}
