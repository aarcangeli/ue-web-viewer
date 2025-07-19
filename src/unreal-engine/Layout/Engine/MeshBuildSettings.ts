// This file is auto-generated, do not edit directly.

import type { FVector } from "../CoreUObject/Vector";
import type { UStaticMesh } from "./StaticMesh";

export class FMeshBuildSettings {
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
  DistanceFieldReplacementMesh: UStaticMesh;
  MaxLumenMeshCards: number;

  constructor(props: {
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
    DistanceFieldReplacementMesh: UStaticMesh;
    MaxLumenMeshCards: number;
  }) {
    this.bUseMikkTSpace = props.bUseMikkTSpace;
    this.bRecomputeNormals = props.bRecomputeNormals;
    this.bRecomputeTangents = props.bRecomputeTangents;
    this.bComputeWeightedNormals = props.bComputeWeightedNormals;
    this.bRemoveDegenerates = props.bRemoveDegenerates;
    this.bBuildReversedIndexBuffer = props.bBuildReversedIndexBuffer;
    this.bUseHighPrecisionTangentBasis = props.bUseHighPrecisionTangentBasis;
    this.bUseFullPrecisionUVs = props.bUseFullPrecisionUVs;
    this.bUseBackwardsCompatibleF16TruncUVs = props.bUseBackwardsCompatibleF16TruncUVs;
    this.bGenerateLightmapUVs = props.bGenerateLightmapUVs;
    this.bGenerateDistanceFieldAsIfTwoSided = props.bGenerateDistanceFieldAsIfTwoSided;
    this.bSupportFaceRemap = props.bSupportFaceRemap;
    this.MinLightmapResolution = props.MinLightmapResolution;
    this.SrcLightmapIndex = props.SrcLightmapIndex;
    this.DstLightmapIndex = props.DstLightmapIndex;
    this.BuildScale = props.BuildScale;
    this.BuildScale3D = props.BuildScale3D;
    this.DistanceFieldResolutionScale = props.DistanceFieldResolutionScale;
    this.DistanceFieldBias = props.DistanceFieldBias;
    this.DistanceFieldReplacementMesh = props.DistanceFieldReplacementMesh;
    this.MaxLumenMeshCards = props.MaxLumenMeshCards;
  }
}
