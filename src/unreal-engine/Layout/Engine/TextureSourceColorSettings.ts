// This file is auto-generated, do not edit directly.

import { ETextureChromaticAdaptationMethod } from "./ETextureChromaticAdaptationMethod";
import { ETextureColorSpace } from "./ETextureColorSpace";
import { ETextureSourceEncoding } from "./ETextureSourceEncoding";
import { FVector2D } from "../CoreUObject/Vector2D";

export class FTextureSourceColorSettings {
  EncodingOverride: ETextureSourceEncoding = ETextureSourceEncoding.TSE_None;
  ColorSpace: ETextureColorSpace = ETextureColorSpace.TCS_None;
  RedChromaticityCoordinate: FVector2D = new FVector2D();
  GreenChromaticityCoordinate: FVector2D = new FVector2D();
  BlueChromaticityCoordinate: FVector2D = new FVector2D();
  WhiteChromaticityCoordinate: FVector2D = new FVector2D();
  ChromaticAdaptationMethod: ETextureChromaticAdaptationMethod = ETextureChromaticAdaptationMethod.TCAM_None;
}
