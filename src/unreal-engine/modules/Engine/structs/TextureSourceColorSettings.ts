import { FVector2 } from "../../CoreUObject/structs/Vector2";
import { ETextureChromaticAdaptationMethod } from "../enums/ETextureChromaticAdaptationMethod";
import { ETextureColorSpace } from "../enums/ETextureColorSpace";
import { ETextureSourceEncoding } from "../enums/ETextureSourceEncoding";

export class FTextureSourceColorSettings {
  EncodingOverride: ETextureSourceEncoding = ETextureSourceEncoding.TSE_None;
  ColorSpace: ETextureColorSpace = ETextureColorSpace.TCS_None;
  RedChromaticityCoordinate: FVector2 = new FVector2();
  GreenChromaticityCoordinate: FVector2 = new FVector2();
  BlueChromaticityCoordinate: FVector2 = new FVector2();
  WhiteChromaticityCoordinate: FVector2 = new FVector2();
  ChromaticAdaptationMethod: ETextureChromaticAdaptationMethod = ETextureChromaticAdaptationMethod.TCAM_None;
}
