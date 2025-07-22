import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "../../CoreUObject/objects/Object";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";
import { FLightmassMaterialInterfaceSettings } from "../structs/LightmassMaterialInterfaceSettings";
import type { FMaterialTextureInfo } from "../structs/MaterialTextureInfo";
import type { UAssetImportData } from "./AssetImportData";
import type { UAssetUserData } from "./AssetUserData";
import type { UMaterialInterfaceEditorOnlyData } from "./MaterialInterfaceEditorOnlyData";
import type { UNeuralProfile } from "./NeuralProfile";
import type { USpecularProfile } from "./SpecularProfile";
import type { USubsurfaceProfile } from "./SubsurfaceProfile";
import type { UThumbnailInfo } from "./ThumbnailInfo";

@RegisterClass("/Script/Engine.MaterialInterface")
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
  LightingGuid: FGuid = GUID_None;
}
