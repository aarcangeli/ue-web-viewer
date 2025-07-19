// This file is auto-generated, do not edit directly.

import type { EMeshFeatureImportance } from "./EMeshFeatureImportance";
import type { EStaticMeshReductionTerimationCriterion } from "./EStaticMeshReductionTerimationCriterion";

export interface FMeshReductionSettings {
  PercentTriangles: number;
  MaxNumOfTriangles: number;
  PercentVertices: number;
  MaxNumOfVerts: number;
  MaxDeviation: number;
  PixelError: number;
  WeldingThreshold: number;
  HardAngleThreshold: number;
  BaseLODModel: number;
  SilhouetteImportance: EMeshFeatureImportance;
  TextureImportance: EMeshFeatureImportance;
  ShadingImportance: EMeshFeatureImportance;
  bRecalculateNormals: boolean;
  bGenerateUniqueLightmapUVs: boolean;
  bKeepSymmetry: boolean;
  bVisibilityAided: boolean;
  bCullOccluded: boolean;
  TerminationCriterion: EStaticMeshReductionTerimationCriterion;
  VisibilityAggressiveness: EMeshFeatureImportance;
  VertexColorImportance: EMeshFeatureImportance;
}
