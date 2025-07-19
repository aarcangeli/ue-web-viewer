// This file is auto-generated, do not edit directly.

import type { FGuid } from "../CoreUObject/Guid";
import type { FLightmassMaterialInterfaceSettings } from "./LightmassMaterialInterfaceSettings";
import type { FMaterialTextureInfo } from "./MaterialTextureInfo";
import type { FSoftObjectPath } from "../CoreUObject/SoftObjectPath";
import type { UAssetImportData } from "./AssetImportData";
import type { UAssetUserData } from "./AssetUserData";
import type { UMaterialInterfaceEditorOnlyData } from "./MaterialInterfaceEditorOnlyData";
import type { UNeuralProfile } from "./NeuralProfile";
import type { UObject } from "../CoreUObject/Object";
import type { USpecularProfile } from "./SpecularProfile";
import type { USubsurfaceProfile } from "./SubsurfaceProfile";
import type { UThumbnailInfo } from "./ThumbnailInfo";

export interface UMaterialInterface extends UObject {
  EditorOnlyData: UMaterialInterfaceEditorOnlyData; // Editor only property
  SubsurfaceProfile: USubsurfaceProfile;
  SubsurfaceProfiles: Array<USubsurfaceProfile>;
  SpecularProfiles: Array<USpecularProfile>;
  NeuralProfile: UNeuralProfile;
  LightmassSettings: FLightmassMaterialInterfaceSettings;
  TextureStreamingDataVersion: number; // Editor only property
  TextureStreamingData: Array<FMaterialTextureInfo>;
  AssetUserData: Array<UAssetUserData>;
  bIncludedInBaseGame: boolean;
  PreviewMesh: FSoftObjectPath; // Editor only property
  ThumbnailInfo: UThumbnailInfo; // Editor only property
  LayerParameterExpansion: Map<string, boolean>; // Editor only property
  ParameterOverviewExpansion: Map<string, boolean>; // Editor only property
  AssetImportData: UAssetImportData; // Editor only property
  LightingGuid: FGuid; // Editor only property
}
