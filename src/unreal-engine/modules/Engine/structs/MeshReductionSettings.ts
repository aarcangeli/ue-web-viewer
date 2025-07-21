import { EMeshFeatureImportance } from "../enums/EMeshFeatureImportance";
import { EStaticMeshReductionTerimationCriterion } from "../enums/EStaticMeshReductionTerimationCriterion";

export class FMeshReductionSettings {
  PercentTriangles: number = 0;
  MaxNumOfTriangles: number = 0;
  PercentVertices: number = 0;
  MaxNumOfVerts: number = 0;
  MaxDeviation: number = 0;
  PixelError: number = 0;
  WeldingThreshold: number = 0;
  HardAngleThreshold: number = 0;
  BaseLODModel: number = 0;
  SilhouetteImportance: EMeshFeatureImportance = EMeshFeatureImportance.Off;
  TextureImportance: EMeshFeatureImportance = EMeshFeatureImportance.Off;
  ShadingImportance: EMeshFeatureImportance = EMeshFeatureImportance.Off;
  bRecalculateNormals: boolean = false;
  bGenerateUniqueLightmapUVs: boolean = false;
  bKeepSymmetry: boolean = false;
  bVisibilityAided: boolean = false;
  bCullOccluded: boolean = false;
  TerminationCriterion: EStaticMeshReductionTerimationCriterion = EStaticMeshReductionTerimationCriterion.Triangles;
  VisibilityAggressiveness: EMeshFeatureImportance = EMeshFeatureImportance.Off;
  VertexColorImportance: EMeshFeatureImportance = EMeshFeatureImportance.Off;
}
