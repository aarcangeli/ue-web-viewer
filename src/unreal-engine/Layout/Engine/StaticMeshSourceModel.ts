// This file is auto-generated, do not edit directly.

import type { FMeshBuildSettings } from "./MeshBuildSettings";
import type { FMeshReductionSettings } from "./MeshReductionSettings";
import type { FPerPlatformFloat } from "../CoreUObject/PerPlatformFloat";
import type { UStaticMeshDescriptionBulkData } from "./StaticMeshDescriptionBulkData";

export class FStaticMeshSourceModel {
  StaticMeshDescriptionBulkData: UStaticMeshDescriptionBulkData;
  BuildSettings: FMeshBuildSettings;
  ReductionSettings: FMeshReductionSettings;
  CacheMeshDescriptionTrianglesCount: number;
  CacheMeshDescriptionVerticesCount: number;
  LODDistance: number;
  ScreenSize: FPerPlatformFloat;
  SourceImportFilename: string;
  bImportWithBaseMesh: boolean;

  constructor(props: {
    StaticMeshDescriptionBulkData: UStaticMeshDescriptionBulkData;
    BuildSettings: FMeshBuildSettings;
    ReductionSettings: FMeshReductionSettings;
    CacheMeshDescriptionTrianglesCount: number;
    CacheMeshDescriptionVerticesCount: number;
    LODDistance: number;
    ScreenSize: FPerPlatformFloat;
    SourceImportFilename: string;
    bImportWithBaseMesh: boolean;
  }) {
    this.StaticMeshDescriptionBulkData = props.StaticMeshDescriptionBulkData;
    this.BuildSettings = props.BuildSettings;
    this.ReductionSettings = props.ReductionSettings;
    this.CacheMeshDescriptionTrianglesCount = props.CacheMeshDescriptionTrianglesCount;
    this.CacheMeshDescriptionVerticesCount = props.CacheMeshDescriptionVerticesCount;
    this.LODDistance = props.LODDistance;
    this.ScreenSize = props.ScreenSize;
    this.SourceImportFilename = props.SourceImportFilename;
    this.bImportWithBaseMesh = props.bImportWithBaseMesh;
  }
}
