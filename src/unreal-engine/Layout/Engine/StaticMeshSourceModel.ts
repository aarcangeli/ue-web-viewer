// This file is auto-generated, do not edit directly.

import { FMeshBuildSettings } from "./MeshBuildSettings";
import { FMeshReductionSettings } from "./MeshReductionSettings";
import { FPerPlatformFloat } from "../CoreUObject/PerPlatformFloat";
import type { UStaticMeshDescriptionBulkData } from "./StaticMeshDescriptionBulkData";

export class FStaticMeshSourceModel {
  StaticMeshDescriptionBulkData: UStaticMeshDescriptionBulkData | null = null;
  BuildSettings: FMeshBuildSettings = new FMeshBuildSettings();
  ReductionSettings: FMeshReductionSettings = new FMeshReductionSettings();
  CacheMeshDescriptionTrianglesCount: number = 0;
  CacheMeshDescriptionVerticesCount: number = 0;
  LODDistance: number = 0;
  ScreenSize: FPerPlatformFloat = new FPerPlatformFloat();
  SourceImportFilename: string = "";
  bImportWithBaseMesh: boolean = false;
}
