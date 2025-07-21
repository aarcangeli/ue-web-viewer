import type { FNaniteAssemblyNode } from "./NaniteAssemblyNode";
import type { FNaniteAssemblyPart } from "./NaniteAssemblyPart";

export class FNaniteAssemblyData {
  Parts: Array<FNaniteAssemblyPart> = [];
  Nodes: Array<FNaniteAssemblyNode> = [];
}
