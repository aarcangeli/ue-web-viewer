// This file is auto-generated, do not edit directly.

import type { FRotator } from "../CoreUObject/Rotator";
import type { FVector } from "../CoreUObject/Vector";

export class FAssetEditorOrbitCameraPosition {
  bIsSet: boolean;
  CamOrbitPoint: FVector;
  CamOrbitZoom: FVector;
  CamOrbitRotation: FRotator;

  constructor(props: { bIsSet: boolean; CamOrbitPoint: FVector; CamOrbitZoom: FVector; CamOrbitRotation: FRotator }) {
    this.bIsSet = props.bIsSet;
    this.CamOrbitPoint = props.CamOrbitPoint;
    this.CamOrbitZoom = props.CamOrbitZoom;
    this.CamOrbitRotation = props.CamOrbitRotation;
  }
}
