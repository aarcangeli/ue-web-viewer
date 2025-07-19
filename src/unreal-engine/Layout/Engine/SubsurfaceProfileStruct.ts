// This file is auto-generated, do not edit directly.

import type { ESubsurfaceImplementationTechniqueHint } from "./ESubsurfaceImplementationTechniqueHint";
import type { FLinearColor } from "../CoreUObject/LinearColor";

export interface FSubsurfaceProfileStruct {
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
}
