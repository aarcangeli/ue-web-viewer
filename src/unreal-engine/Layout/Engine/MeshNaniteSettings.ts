// This file is auto-generated, do not edit directly.

import type { FMeshDisplacementMap } from "./MeshDisplacementMap";
import type { FNaniteAssemblyData } from "./NaniteAssemblyData";

export interface FMeshNaniteSettings {
  bEnabled: boolean;
  bPreserveArea: boolean;
  bExplicitTangents: boolean;
  bLerpUVs: boolean;
  bSeparable: boolean;
  bVoxelNDF: boolean;
  bVoxelOpacity: boolean;
  PositionPrecision: number;
  NormalPrecision: number;
  TangentPrecision: number;
  BoneWeightPrecision: number;
  TargetMinimumResidencyInKB: number;
  KeepPercentTriangles: number;
  TrimRelativeError: number;
  GenerateFallback: Invalid__EnumProperty;
  FallbackTarget: Invalid__EnumProperty;
  FallbackPercentTriangles: number;
  FallbackRelativeError: number;
  MaxEdgeLengthFactor: number;
  NumRays: number;
  VoxelLevel: number;
  RayBackUp: number;
  DisplacementUVChannel: number;
  DisplacementMaps: Array<FMeshDisplacementMap>;
  NaniteAssemblyData: FNaniteAssemblyData;
}
