// This file is auto-generated, do not edit directly.

import type { ERichCurveInterpMode } from "./ERichCurveInterpMode";
import type { ERichCurveTangentMode } from "./ERichCurveTangentMode";
import type { ERichCurveTangentWeightMode } from "./ERichCurveTangentWeightMode";

export interface FRichCurveKey {
  InterpMode: ERichCurveInterpMode;
  TangentMode: ERichCurveTangentMode;
  TangentWeightMode: ERichCurveTangentWeightMode;
  Time: number;
  Value: number;
  ArriveTangent: number;
  ArriveTangentWeight: number;
  LeaveTangent: number;
  LeaveTangentWeight: number;
}
