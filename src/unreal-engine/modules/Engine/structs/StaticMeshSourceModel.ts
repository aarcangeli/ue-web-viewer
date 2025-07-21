import { FPerPlatformFloat } from "../../CoreUObject/structs/PerPlatformProperties";
import type { UStaticMeshDescriptionBulkData } from "../objects/StaticMeshDescriptionBulkData";

import { FMeshBuildSettings } from "./MeshBuildSettings";
import { FMeshReductionSettings } from "./MeshReductionSettings";

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
