import { ENaniteAssemblyNodeTransformSpace } from "../enums/ENaniteAssemblyNodeTransformSpace";
import { FTransform } from "../../CoreUObject/structs/Transform";
import type { FNaniteAssemblyBoneInfluence } from "./NaniteAssemblyBoneInfluence";

export class FNaniteAssemblyNode {
  PartIndex: number = 0;
  Transform: FTransform = new FTransform();
  TransformSpace: ENaniteAssemblyNodeTransformSpace = ENaniteAssemblyNodeTransformSpace.Local;
  BoneInfluences: Array<FNaniteAssemblyBoneInfluence> = [];
}
