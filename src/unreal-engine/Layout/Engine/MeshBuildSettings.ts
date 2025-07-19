// This file is auto-generated, do not edit directly.

import type { FVector } from "../CoreUObject/Vector";

export interface FMeshBuildSettings {
  bUseMikkTSpace: boolean;
  bRecomputeNormals: boolean;
  bRecomputeTangents: boolean;
  bComputeWeightedNormals: boolean;
  bRemoveDegenerates: boolean;
  bBuildReversedIndexBuffer: boolean;
  bUseHighPrecisionTangentBasis: boolean;
  bUseFullPrecisionUVs: boolean;
  bUseBackwardsCompatibleF16TruncUVs: boolean;
  bGenerateLightmapUVs: boolean;
  bGenerateDistanceFieldAsIfTwoSided: boolean;
  bSupportFaceRemap: boolean;
  MinLightmapResolution: number;
  SrcLightmapIndex: number;
  DstLightmapIndex: number;
  BuildScale: number;
  BuildScale3D: FVector;
  DistanceFieldResolutionScale: number;
  DistanceFieldBias: number;
  DistanceFieldReplacementMesh: Object;
  MaxLumenMeshCards: number;
}
