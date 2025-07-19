// This file is auto-generated, do not edit directly.

import { ERichCurveInterpMode } from "./ERichCurveInterpMode";
import { ERichCurveTangentMode } from "./ERichCurveTangentMode";
import { ERichCurveTangentWeightMode } from "./ERichCurveTangentWeightMode";

export class FRichCurveKey {
  InterpMode: ERichCurveInterpMode = ERichCurveInterpMode.RCIM_Linear;
  TangentMode: ERichCurveTangentMode = ERichCurveTangentMode.RCTM_Auto;
  TangentWeightMode: ERichCurveTangentWeightMode = ERichCurveTangentWeightMode.RCTWM_WeightedNone;
  Time: number = 0;
  Value: number = 0;
  ArriveTangent: number = 0;
  ArriveTangentWeight: number = 0;
  LeaveTangent: number = 0;
  LeaveTangentWeight: number = 0;
}
