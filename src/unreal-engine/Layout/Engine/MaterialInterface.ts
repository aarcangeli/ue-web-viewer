// This file is auto-generated, do not edit directly.

import { FGuid } from "../CoreUObject/Guid";
import { FLightmassMaterialInterfaceSettings } from "./LightmassMaterialInterfaceSettings";
import type { FMaterialTextureInfo } from "./MaterialTextureInfo";
import { FSoftObjectPath } from "../CoreUObject/SoftObjectPath";
import type { UAssetImportData } from "./AssetImportData";
import type { UAssetUserData } from "./AssetUserData";
import type { UMaterialInterfaceEditorOnlyData } from "./MaterialInterfaceEditorOnlyData";
import type { UNeuralProfile } from "./NeuralProfile";
import { UObject } from "../CoreUObject/Object";
import type { USpecularProfile } from "./SpecularProfile";
import type { USubsurfaceProfile } from "./SubsurfaceProfile";
import type { UThumbnailInfo } from "./ThumbnailInfo";

export class UMaterialInterface extends UObject {
  EditorOnlyData: UMaterialInterfaceEditorOnlyData | null = null;
  SubsurfaceProfile: USubsurfaceProfile | null = null;
  SubsurfaceProfiles: Array<USubsurfaceProfile | null> = [];
  SpecularProfiles: Array<USpecularProfile | null> = [];
  NeuralProfile: UNeuralProfile | null = null;
  LightmassSettings: FLightmassMaterialInterfaceSettings = new FLightmassMaterialInterfaceSettings();
  TextureStreamingDataVersion: number = 0;
  TextureStreamingData: Array<FMaterialTextureInfo> = [];
  AssetUserData: Array<UAssetUserData | null> = [];
  bIncludedInBaseGame: boolean = false;
  PreviewMesh: FSoftObjectPath = new FSoftObjectPath();
  ThumbnailInfo: UThumbnailInfo | null = null;
  LayerParameterExpansion: Map<string, boolean> = new Map();
  ParameterOverviewExpansion: Map<string, boolean> = new Map();
  AssetImportData: UAssetImportData | null = null;
  LightingGuid: FGuid = new FGuid();
}
