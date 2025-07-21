import { FLinearColor } from "../../CoreUObject/structs/LinearColor";
import { ESubsurfaceImplementationTechniqueHint } from "../enums/ESubsurfaceImplementationTechniqueHint";

export class FSubsurfaceProfileStruct {
  SurfaceAlbedo: FLinearColor = new FLinearColor();
  MeanFreePathColor: FLinearColor = new FLinearColor();
  MeanFreePathDistance: number = 0;
  WorldUnitScale: number = 0;
  bEnableBurley: boolean = false;
  bEnableMeanFreePath: boolean = false;
  Tint: FLinearColor = new FLinearColor();
  ScatterRadius: number = 0;
  SubsurfaceColor: FLinearColor = new FLinearColor();
  FalloffColor: FLinearColor = new FLinearColor();
  BoundaryColorBleed: FLinearColor = new FLinearColor();
  Implementation: ESubsurfaceImplementationTechniqueHint = ESubsurfaceImplementationTechniqueHint.SIH_AFIS;
  ExtinctionScale: number = 0;
  NormalScale: number = 0;
  ScatteringDistribution: number = 0;
  IOR: number = 0;
  Roughness0: number = 0;
  Roughness1: number = 0;
  LobeMix: number = 0;
  TransmissionTintColor: FLinearColor = new FLinearColor();
}
