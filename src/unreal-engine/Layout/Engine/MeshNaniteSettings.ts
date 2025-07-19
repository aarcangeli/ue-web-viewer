// This file is auto-generated, do not edit directly.

import { ENaniteFallbackTarget } from "./ENaniteFallbackTarget";
import { ENaniteGenerateFallback } from "./ENaniteGenerateFallback";
import type { FMeshDisplacementMap } from "./MeshDisplacementMap";
import { FNaniteAssemblyData } from "./NaniteAssemblyData";

export class FMeshNaniteSettings {
  bEnabled: boolean = false;
  bPreserveArea: boolean = false;
  bExplicitTangents: boolean = false;
  bLerpUVs: boolean = false;
  bSeparable: boolean = false;
  bVoxelNDF: boolean = false;
  bVoxelOpacity: boolean = false;
  PositionPrecision: number = 0;
  NormalPrecision: number = 0;
  TangentPrecision: number = 0;
  BoneWeightPrecision: number = 0;
  TargetMinimumResidencyInKB: number = 0;
  KeepPercentTriangles: number = 0;
  TrimRelativeError: number = 0;
  GenerateFallback: ENaniteGenerateFallback = ENaniteGenerateFallback.PlatformDefault;
  FallbackTarget: ENaniteFallbackTarget = ENaniteFallbackTarget.Auto;
  FallbackPercentTriangles: number = 0;
  FallbackRelativeError: number = 0;
  MaxEdgeLengthFactor: number = 0;
  NumRays: number = 0;
  VoxelLevel: number = 0;
  RayBackUp: number = 0;
  DisplacementUVChannel: number = 0;
  DisplacementMaps: Array<FMeshDisplacementMap> = [];
  NaniteAssemblyData: FNaniteAssemblyData = new FNaniteAssemblyData();
}
