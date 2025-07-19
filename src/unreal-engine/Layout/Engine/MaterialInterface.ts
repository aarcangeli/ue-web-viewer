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
  EditorOnlyData: UMaterialInterfaceEditorOnlyData;
  SubsurfaceProfile: USubsurfaceProfile;
  SubsurfaceProfiles: Array<USubsurfaceProfile>;
  SpecularProfiles: Array<USpecularProfile>;
  NeuralProfile: UNeuralProfile;
  LightmassSettings: FLightmassMaterialInterfaceSettings;
  TextureStreamingDataVersion: number;
  TextureStreamingData: Array<FMaterialTextureInfo>;
  AssetUserData: Array<UAssetUserData>;
  bIncludedInBaseGame: boolean;
  PreviewMesh: FSoftObjectPath;
  ThumbnailInfo: UThumbnailInfo;
  LayerParameterExpansion: Map<string, boolean>;
  ParameterOverviewExpansion: Map<string, boolean>;
  AssetImportData: UAssetImportData;
  LightingGuid: FGuid;
}
