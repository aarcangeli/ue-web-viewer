import { RegisterClass } from "../../../types/class-registry";
import { FRichCurve } from "../structs/RichCurve";
import { UCurveBase } from "./CurveBase";

@RegisterClass("/Script/Engine.CurveLinearColor")
export class UCurveLinearColor extends UCurveBase {
  FloatCurves: FRichCurve = new FRichCurve();
  AdjustHue: number = 0;
  AdjustSaturation: number = 0;
  AdjustBrightness: number = 0;
  AdjustBrightnessCurve: number = 0;
  AdjustVibrance: number = 0;
  AdjustMinAlpha: number = 0;
  AdjustMaxAlpha: number = 0;
}
