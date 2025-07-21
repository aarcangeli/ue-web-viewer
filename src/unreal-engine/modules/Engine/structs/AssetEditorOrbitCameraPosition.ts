import { FRotator } from "../../CoreUObject/structs/Rotator";
import { FVector3 } from "../../CoreUObject/structs/Vector3";

export class FAssetEditorOrbitCameraPosition {
  bIsSet: boolean = false;
  CamOrbitPoint: FVector3 = new FVector3();
  CamOrbitZoom: FVector3 = new FVector3();
  CamOrbitRotation: FRotator = new FRotator();
}
