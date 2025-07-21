import { FMatrix44 } from "../../CoreUObject/structs/Matrix44";

export class FNaniteAssemblyNode {
  ParentIndex: number = 0;
  PartIndex: number = 0;
  Transform: FMatrix44 = new FMatrix44();
}
