import { FVector3 } from "./Vector3";

export class FBoxSphereBounds {
  Origin: FVector3 = new FVector3();
  BoxExtent: FVector3 = new FVector3();
  SphereRadius: number = 0;
}
