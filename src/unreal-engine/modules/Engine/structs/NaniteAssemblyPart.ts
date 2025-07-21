import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";

export class FNaniteAssemblyPart {
  MeshObjectPath: FSoftObjectPath = new FSoftObjectPath();
  MaterialRemap: Array<number> = [];
}
