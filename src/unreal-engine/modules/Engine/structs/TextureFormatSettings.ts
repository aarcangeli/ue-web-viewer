import { TextureCompressionSettings } from "../enums/TextureCompressionSettings";

export class FTextureFormatSettings {
  CompressionSettings: TextureCompressionSettings = TextureCompressionSettings.TC_Default;
  CompressionNoAlpha: boolean = false;
  CompressionForceAlpha: boolean = false;
  CompressionNone: boolean = false;
  CompressionYCoCg: boolean = false;
  SRGB: boolean = false;
}
