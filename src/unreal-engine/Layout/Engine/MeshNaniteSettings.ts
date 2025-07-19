// This file is auto-generated, do not edit directly.

import type { ENaniteFallbackTarget } from "./ENaniteFallbackTarget";
import type { ENaniteGenerateFallback } from "./ENaniteGenerateFallback";
import type { FMeshDisplacementMap } from "./MeshDisplacementMap";
import type { FNaniteAssemblyData } from "./NaniteAssemblyData";

export class FMeshNaniteSettings {
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
  GenerateFallback: ENaniteGenerateFallback;
  FallbackTarget: ENaniteFallbackTarget;
  FallbackPercentTriangles: number;
  FallbackRelativeError: number;
  MaxEdgeLengthFactor: number;
  NumRays: number;
  VoxelLevel: number;
  RayBackUp: number;
  DisplacementUVChannel: number;
  DisplacementMaps: Array<FMeshDisplacementMap>;
  NaniteAssemblyData: FNaniteAssemblyData;

  constructor(props: {
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
    GenerateFallback: ENaniteGenerateFallback;
    FallbackTarget: ENaniteFallbackTarget;
    FallbackPercentTriangles: number;
    FallbackRelativeError: number;
    MaxEdgeLengthFactor: number;
    NumRays: number;
    VoxelLevel: number;
    RayBackUp: number;
    DisplacementUVChannel: number;
    DisplacementMaps: Array<FMeshDisplacementMap>;
    NaniteAssemblyData: FNaniteAssemblyData;
  }) {
    this.bEnabled = props.bEnabled;
    this.bPreserveArea = props.bPreserveArea;
    this.bExplicitTangents = props.bExplicitTangents;
    this.bLerpUVs = props.bLerpUVs;
    this.bSeparable = props.bSeparable;
    this.bVoxelNDF = props.bVoxelNDF;
    this.bVoxelOpacity = props.bVoxelOpacity;
    this.PositionPrecision = props.PositionPrecision;
    this.NormalPrecision = props.NormalPrecision;
    this.TangentPrecision = props.TangentPrecision;
    this.BoneWeightPrecision = props.BoneWeightPrecision;
    this.TargetMinimumResidencyInKB = props.TargetMinimumResidencyInKB;
    this.KeepPercentTriangles = props.KeepPercentTriangles;
    this.TrimRelativeError = props.TrimRelativeError;
    this.GenerateFallback = props.GenerateFallback;
    this.FallbackTarget = props.FallbackTarget;
    this.FallbackPercentTriangles = props.FallbackPercentTriangles;
    this.FallbackRelativeError = props.FallbackRelativeError;
    this.MaxEdgeLengthFactor = props.MaxEdgeLengthFactor;
    this.NumRays = props.NumRays;
    this.VoxelLevel = props.VoxelLevel;
    this.RayBackUp = props.RayBackUp;
    this.DisplacementUVChannel = props.DisplacementUVChannel;
    this.DisplacementMaps = props.DisplacementMaps;
    this.NaniteAssemblyData = props.NaniteAssemblyData;
  }
}
