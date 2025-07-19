// This file is auto-generated, do not edit directly.

import type { ESpecularProfileFormat } from "./ESpecularProfileFormat";
import type { FRuntimeCurveLinearColor } from "./RuntimeCurveLinearColor";
import type { UTexture2D } from "./Texture2D";

export class FSpecularProfileStruct {
  Format: ESpecularProfileFormat;
  ViewColor: FRuntimeCurveLinearColor;
  LightColor: FRuntimeCurveLinearColor;
  Texture: UTexture2D;

  constructor(props: {
    Format: ESpecularProfileFormat;
    ViewColor: FRuntimeCurveLinearColor;
    LightColor: FRuntimeCurveLinearColor;
    Texture: UTexture2D;
  }) {
    this.Format = props.Format;
    this.ViewColor = props.ViewColor;
    this.LightColor = props.LightColor;
    this.Texture = props.Texture;
  }
}
