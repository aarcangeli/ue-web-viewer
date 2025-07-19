// This file is auto-generated, do not edit directly.

import type { EMeshFeatureImportance } from "./EMeshFeatureImportance";
import type { EStaticMeshReductionTerimationCriterion } from "./EStaticMeshReductionTerimationCriterion";

export class FMeshReductionSettings {
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

  constructor(props: {
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
  }) {
    this.PercentTriangles = props.PercentTriangles;
    this.MaxNumOfTriangles = props.MaxNumOfTriangles;
    this.PercentVertices = props.PercentVertices;
    this.MaxNumOfVerts = props.MaxNumOfVerts;
    this.MaxDeviation = props.MaxDeviation;
    this.PixelError = props.PixelError;
    this.WeldingThreshold = props.WeldingThreshold;
    this.HardAngleThreshold = props.HardAngleThreshold;
    this.BaseLODModel = props.BaseLODModel;
    this.SilhouetteImportance = props.SilhouetteImportance;
    this.TextureImportance = props.TextureImportance;
    this.ShadingImportance = props.ShadingImportance;
    this.bRecalculateNormals = props.bRecalculateNormals;
    this.bGenerateUniqueLightmapUVs = props.bGenerateUniqueLightmapUVs;
    this.bKeepSymmetry = props.bKeepSymmetry;
    this.bVisibilityAided = props.bVisibilityAided;
    this.bCullOccluded = props.bCullOccluded;
    this.TerminationCriterion = props.TerminationCriterion;
    this.VisibilityAggressiveness = props.VisibilityAggressiveness;
    this.VertexColorImportance = props.VertexColorImportance;
  }
}
