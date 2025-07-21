import { ENaniteFallbackTarget } from "../enums/ENaniteFallbackTarget";

export class FMeshRayTracingProxySettings {
  bEnabled: boolean = false;
  FallbackTarget: ENaniteFallbackTarget = ENaniteFallbackTarget.Auto;
  FallbackPercentTriangles: number = 0;
  FallbackRelativeError: number = 0;
  LOD1PercentTriangles: number = 0;
  FoliageOverOcclusionBias: number = 0;
}
