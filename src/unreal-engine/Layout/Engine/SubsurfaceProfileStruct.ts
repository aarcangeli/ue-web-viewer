// This file is auto-generated, do not edit directly.

import type { ESubsurfaceImplementationTechniqueHint } from "./ESubsurfaceImplementationTechniqueHint";
import type { FLinearColor } from "../CoreUObject/LinearColor";

export class FSubsurfaceProfileStruct {
  SurfaceAlbedo: FLinearColor;
  MeanFreePathColor: FLinearColor;
  MeanFreePathDistance: number;
  WorldUnitScale: number;
  bEnableBurley: boolean;
  bEnableMeanFreePath: boolean;
  Tint: FLinearColor;
  ScatterRadius: number;
  SubsurfaceColor: FLinearColor;
  FalloffColor: FLinearColor;
  BoundaryColorBleed: FLinearColor;
  Implementation: ESubsurfaceImplementationTechniqueHint;
  ExtinctionScale: number;
  NormalScale: number;
  ScatteringDistribution: number;
  IOR: number;
  Roughness0: number;
  Roughness1: number;
  LobeMix: number;
  TransmissionTintColor: FLinearColor;

  constructor(props: {
    SurfaceAlbedo: FLinearColor;
    MeanFreePathColor: FLinearColor;
    MeanFreePathDistance: number;
    WorldUnitScale: number;
    bEnableBurley: boolean;
    bEnableMeanFreePath: boolean;
    Tint: FLinearColor;
    ScatterRadius: number;
    SubsurfaceColor: FLinearColor;
    FalloffColor: FLinearColor;
    BoundaryColorBleed: FLinearColor;
    Implementation: ESubsurfaceImplementationTechniqueHint;
    ExtinctionScale: number;
    NormalScale: number;
    ScatteringDistribution: number;
    IOR: number;
    Roughness0: number;
    Roughness1: number;
    LobeMix: number;
    TransmissionTintColor: FLinearColor;
  }) {
    this.SurfaceAlbedo = props.SurfaceAlbedo;
    this.MeanFreePathColor = props.MeanFreePathColor;
    this.MeanFreePathDistance = props.MeanFreePathDistance;
    this.WorldUnitScale = props.WorldUnitScale;
    this.bEnableBurley = props.bEnableBurley;
    this.bEnableMeanFreePath = props.bEnableMeanFreePath;
    this.Tint = props.Tint;
    this.ScatterRadius = props.ScatterRadius;
    this.SubsurfaceColor = props.SubsurfaceColor;
    this.FalloffColor = props.FalloffColor;
    this.BoundaryColorBleed = props.BoundaryColorBleed;
    this.Implementation = props.Implementation;
    this.ExtinctionScale = props.ExtinctionScale;
    this.NormalScale = props.NormalScale;
    this.ScatteringDistribution = props.ScatteringDistribution;
    this.IOR = props.IOR;
    this.Roughness0 = props.Roughness0;
    this.Roughness1 = props.Roughness1;
    this.LobeMix = props.LobeMix;
    this.TransmissionTintColor = props.TransmissionTintColor;
  }
}
