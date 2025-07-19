// This file is auto-generated, do not edit directly.

import type { ERichCurveInterpMode } from "./ERichCurveInterpMode";
import type { ERichCurveTangentMode } from "./ERichCurveTangentMode";
import type { ERichCurveTangentWeightMode } from "./ERichCurveTangentWeightMode";

export class FRichCurveKey {
  InterpMode: ERichCurveInterpMode;
  TangentMode: ERichCurveTangentMode;
  TangentWeightMode: ERichCurveTangentWeightMode;
  Time: number;
  Value: number;
  ArriveTangent: number;
  ArriveTangentWeight: number;
  LeaveTangent: number;
  LeaveTangentWeight: number;

  constructor(props: {
    InterpMode: ERichCurveInterpMode;
    TangentMode: ERichCurveTangentMode;
    TangentWeightMode: ERichCurveTangentWeightMode;
    Time: number;
    Value: number;
    ArriveTangent: number;
    ArriveTangentWeight: number;
    LeaveTangent: number;
    LeaveTangentWeight: number;
  }) {
    this.InterpMode = props.InterpMode;
    this.TangentMode = props.TangentMode;
    this.TangentWeightMode = props.TangentWeightMode;
    this.Time = props.Time;
    this.Value = props.Value;
    this.ArriveTangent = props.ArriveTangent;
    this.ArriveTangentWeight = props.ArriveTangentWeight;
    this.LeaveTangent = props.LeaveTangent;
    this.LeaveTangentWeight = props.LeaveTangentWeight;
  }
}
