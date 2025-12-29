import { FVector3 } from "../../CoreUObject/structs/Vector3";
import type { UStaticMesh } from "../objects/StaticMesh";

export class FMeshBuildSettings {
  bUseMikkTSpace: boolean = false;
  bRecomputeNormals: boolean = false;
  bRecomputeTangents: boolean = false;
  bComputeWeightedNormals: boolean = false;
  bRemoveDegenerates: boolean = false;
  bBuildReversedIndexBuffer: boolean = false;
  bUseHighPrecisionTangentBasis: boolean = false;
  bUseFullPrecisionUVs: boolean = false;
  bUseBackwardsCompatibleF16TruncUVs: boolean = false;
  bGenerateLightmapUVs: boolean = false;
  bGenerateDistanceFieldAsIfTwoSided: boolean = false;
  bSupportFaceRemap: boolean = false;
  MinLightmapResolution: number = 0;
  SrcLightmapIndex: number = 0;
  DstLightmapIndex: number = 0;
  BuildScale: number = 0;
  BuildScale3D: FVector3 = new FVector3();
  DistanceFieldResolutionScale: number = 0;
  DistanceFieldReplacementMesh: UStaticMesh | null = null;
  MaxLumenMeshCards: number = 0;
}
