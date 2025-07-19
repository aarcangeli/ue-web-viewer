// This file is auto-generated, do not edit directly.

import type { ETextureChromaticAdaptationMethod } from "./ETextureChromaticAdaptationMethod";
import type { ETextureColorSpace } from "./ETextureColorSpace";
import type { ETextureSourceEncoding } from "./ETextureSourceEncoding";
import type { FVector2D } from "../CoreUObject/Vector2D";

export class FTextureSourceColorSettings {
  EncodingOverride: ETextureSourceEncoding;
  ColorSpace: ETextureColorSpace;
  RedChromaticityCoordinate: FVector2D;
  GreenChromaticityCoordinate: FVector2D;
  BlueChromaticityCoordinate: FVector2D;
  WhiteChromaticityCoordinate: FVector2D;
  ChromaticAdaptationMethod: ETextureChromaticAdaptationMethod;

  constructor(props: {
    EncodingOverride: ETextureSourceEncoding;
    ColorSpace: ETextureColorSpace;
    RedChromaticityCoordinate: FVector2D;
    GreenChromaticityCoordinate: FVector2D;
    BlueChromaticityCoordinate: FVector2D;
    WhiteChromaticityCoordinate: FVector2D;
    ChromaticAdaptationMethod: ETextureChromaticAdaptationMethod;
  }) {
    this.EncodingOverride = props.EncodingOverride;
    this.ColorSpace = props.ColorSpace;
    this.RedChromaticityCoordinate = props.RedChromaticityCoordinate;
    this.GreenChromaticityCoordinate = props.GreenChromaticityCoordinate;
    this.BlueChromaticityCoordinate = props.BlueChromaticityCoordinate;
    this.WhiteChromaticityCoordinate = props.WhiteChromaticityCoordinate;
    this.ChromaticAdaptationMethod = props.ChromaticAdaptationMethod;
  }
}
