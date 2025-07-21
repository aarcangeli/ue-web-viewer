import { ESpecularProfileFormat } from "../enums/ESpecularProfileFormat";
import type { UTexture2D } from "../objects/Texture2D";
import { FRuntimeCurveLinearColor } from "./RuntimeCurveLinearColor";

export class FSpecularProfileStruct {
  Format: ESpecularProfileFormat = ESpecularProfileFormat.ViewLightVector;
  ViewColor: FRuntimeCurveLinearColor = new FRuntimeCurveLinearColor();
  LightColor: FRuntimeCurveLinearColor = new FRuntimeCurveLinearColor();
  Texture: UTexture2D | null = null;
}
