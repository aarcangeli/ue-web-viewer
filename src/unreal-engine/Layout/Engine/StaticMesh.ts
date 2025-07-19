// This file is auto-generated, do not edit directly.

import type { EStaticMeshPaintSupport } from "./EStaticMeshPaintSupport";
import type { FAssetEditorOrbitCameraPosition } from "./AssetEditorOrbitCameraPosition";
import type { FBoxSphereBounds } from "../CoreUObject/BoxSphereBounds";
import type { FMaterialRemapIndex } from "./MaterialRemapIndex";
import type { FMeshNaniteSettings } from "./MeshNaniteSettings";
import type { FMeshRayTracingProxySettings } from "./MeshRayTracingProxySettings";
import type { FMeshSectionInfoMap } from "./MeshSectionInfoMap";
import type { FPerPlatformInt } from "../CoreUObject/PerPlatformInt";
import type { FPerQualityLevelInt } from "./PerQualityLevelInt";
import type { FStaticMaterial } from "./StaticMaterial";
import type { FStaticMeshSourceModel } from "./StaticMeshSourceModel";
import type { FVector } from "../CoreUObject/Vector";
import type { UAssetImportData } from "./AssetImportData";
import type { UAssetUserData } from "./AssetUserData";
import type { UMaterialInterface } from "./MaterialInterface";
import type { UObject } from "../CoreUObject/Object";
import type { UStaticMeshSocket } from "./StaticMeshSocket";
import type { UStreamableRenderAsset } from "./StreamableRenderAsset";
import type { UThumbnailInfo } from "./ThumbnailInfo";

export interface UStaticMesh extends UStreamableRenderAsset {
  SourceModels: Array<FStaticMeshSourceModel>; // Editor only property
  HiResSourceModel: FStaticMeshSourceModel; // Editor only property
  SectionInfoMap: FMeshSectionInfoMap; // Editor only property
  OriginalSectionInfoMap: FMeshSectionInfoMap; // Editor only property
  LODGroup: string; // Editor only property
  NumStreamedLODs: FPerPlatformInt; // Editor only property
  ImportVersion: number; // Editor only property
  MaterialRemapIndexPerImportVersion: Array<FMaterialRemapIndex>; // Editor only property
  LightmapUVVersion: number; // Editor only property
  bAutoComputeLODScreenSize: boolean; // Editor only property
  Materials: Array<UMaterialInterface>; // Editor only property
  NaniteSettings: FMeshNaniteSettings; // Editor only property
  MinQualityLevelLOD: FPerQualityLevelInt;
  MinLOD: FPerPlatformInt;
  ElementToIgnoreForTexFactor: number;
  StaticMaterials: Array<FStaticMaterial>;
  LightmapUVDensity: number;
  LightMapResolution: number;
  LightMapCoordinateIndex: number;
  StaticMeshPaintSupport: EStaticMeshPaintSupport;
  MeshPaintTextureCoordinateIndex: number;
  MeshPaintTextureResolution: number;
  DistanceFieldSelfShadowBias: number;
  LODForCollision: number;
  bGenerateMeshDistanceField: boolean;
  bStripComplexCollisionForConsole: boolean;
  bHasNavigationData: boolean;
  bSupportUniformlyDistributedSampling: boolean;
  bSupportPhysicalMaterialMasks: boolean;
  bUseLegacyTangentScaling: boolean; // Editor only property
  RayTracingProxySettings: FMeshRayTracingProxySettings; // Editor only property
  bSupportRayTracing: boolean;
  bDoFastBuild: boolean;
  bIsBuiltAtRuntime: boolean;
  bAllowCPUAccess: boolean;
  bSupportGpuUniformlyDistributedSampling: boolean;
  AssetImportData: UAssetImportData; // Editor only property
  SourceFilePath: string; // Editor only property
  SourceFileTimestamp: string; // Editor only property
  ThumbnailInfo: UThumbnailInfo; // Editor only property
  EditorCameraPosition: FAssetEditorOrbitCameraPosition; // Editor only property
  bCustomizedCollision: boolean; // Editor only property
  Sockets: Array<UStaticMeshSocket>;
  PositiveBoundsExtension: FVector;
  NegativeBoundsExtension: FVector;
  ExtendedBounds: FBoxSphereBounds;
  AssetUserData: Array<UAssetUserData>;
  EditableMesh: UObject; // Editor only property
  ComplexCollisionMesh: UStaticMesh; // Editor only property
}
