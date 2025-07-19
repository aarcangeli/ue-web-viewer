// This file is auto-generated, do not edit directly.

import type { ENaniteFallbackTarget } from "./ENaniteFallbackTarget";

export class FMeshRayTracingProxySettings {
  bEnabled: boolean;
  FallbackTarget: ENaniteFallbackTarget;
  FallbackPercentTriangles: number;
  FallbackRelativeError: number;
  LOD1PercentTriangles: number;
  FoliageOverOcclusionBias: number;

  constructor(props: {
    bEnabled: boolean;
    FallbackTarget: ENaniteFallbackTarget;
    FallbackPercentTriangles: number;
    FallbackRelativeError: number;
    LOD1PercentTriangles: number;
    FoliageOverOcclusionBias: number;
  }) {
    this.bEnabled = props.bEnabled;
    this.FallbackTarget = props.FallbackTarget;
    this.FallbackPercentTriangles = props.FallbackPercentTriangles;
    this.FallbackRelativeError = props.FallbackRelativeError;
    this.LOD1PercentTriangles = props.LOD1PercentTriangles;
    this.FoliageOverOcclusionBias = props.FoliageOverOcclusionBias;
  }
}
