// This file is auto-generated, do not edit directly.

import { ESpecularProfileFormat } from "./ESpecularProfileFormat";
import { FRuntimeCurveLinearColor } from "./RuntimeCurveLinearColor";
import type { UTexture2D } from "./Texture2D";

export class FSpecularProfileStruct {
  Format: ESpecularProfileFormat = ESpecularProfileFormat.ViewLightVector;
  ViewColor: FRuntimeCurveLinearColor = new FRuntimeCurveLinearColor();
  LightColor: FRuntimeCurveLinearColor = new FRuntimeCurveLinearColor();
  Texture: UTexture2D | null = null;
}
