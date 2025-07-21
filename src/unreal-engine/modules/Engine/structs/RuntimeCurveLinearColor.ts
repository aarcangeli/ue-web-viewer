import type { UCurveLinearColor } from "../objects/CurveLinearColor";
import { FRichCurve } from "./RichCurve";

export class FRuntimeCurveLinearColor {
  ColorCurves: FRichCurve = new FRichCurve();
  ExternalCurve: UCurveLinearColor | null = null;
}
