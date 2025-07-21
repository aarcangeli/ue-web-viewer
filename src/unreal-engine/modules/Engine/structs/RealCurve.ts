import { ERichCurveExtrapolation } from "../enums/ERichCurveExtrapolation";
import { FIndexedCurve } from "./IndexedCurve";

export class FRealCurve extends FIndexedCurve {
  DefaultValue: number = 0;
  PreInfinityExtrap: ERichCurveExtrapolation = ERichCurveExtrapolation.RCCE_Cycle;
  PostInfinityExtrap: ERichCurveExtrapolation = ERichCurveExtrapolation.RCCE_Cycle;
}
