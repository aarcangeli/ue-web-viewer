// This file is auto-generated, do not edit directly.

import type { TextureCompressionSettings } from "./TextureCompressionSettings";

export class FTextureFormatSettings {
  CompressionSettings: TextureCompressionSettings;
  CompressionNoAlpha: boolean;
  CompressionForceAlpha: boolean;
  CompressionNone: boolean;
  CompressionYCoCg: boolean;
  SRGB: boolean;

  constructor(props: {
    CompressionSettings: TextureCompressionSettings;
    CompressionNoAlpha: boolean;
    CompressionForceAlpha: boolean;
    CompressionNone: boolean;
    CompressionYCoCg: boolean;
    SRGB: boolean;
  }) {
    this.CompressionSettings = props.CompressionSettings;
    this.CompressionNoAlpha = props.CompressionNoAlpha;
    this.CompressionForceAlpha = props.CompressionForceAlpha;
    this.CompressionNone = props.CompressionNone;
    this.CompressionYCoCg = props.CompressionYCoCg;
    this.SRGB = props.SRGB;
  }
}
