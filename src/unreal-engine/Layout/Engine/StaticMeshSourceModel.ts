// This file is auto-generated, do not edit directly.

import type { FMeshBuildSettings } from "./MeshBuildSettings";
import type { FMeshReductionSettings } from "./MeshReductionSettings";
import type { FPerPlatformFloat } from "../CoreUObject/PerPlatformFloat";
import type { UStaticMeshDescriptionBulkData } from "./StaticMeshDescriptionBulkData";

export interface FStaticMeshSourceModel {
  StaticMeshDescriptionBulkData: UStaticMeshDescriptionBulkData;
  BuildSettings: FMeshBuildSettings;
  ReductionSettings: FMeshReductionSettings;
  CacheMeshDescriptionTrianglesCount: number;
  CacheMeshDescriptionVerticesCount: number;
  LODDistance: number;
  ScreenSize: FPerPlatformFloat;
  SourceImportFilename: string;
  bImportWithBaseMesh: boolean;
}
