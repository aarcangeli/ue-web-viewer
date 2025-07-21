import { FRealCurve } from "./RealCurve";
import type { FRichCurveKey } from "./RichCurveKey";

export class FRichCurve extends FRealCurve {
  Keys: Array<FRichCurveKey> = [];
}
