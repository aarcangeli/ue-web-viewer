// This file is auto-generated, do not edit directly.

import type { FNaniteAssemblyNode } from "./NaniteAssemblyNode";
import type { FNaniteAssemblyPart } from "./NaniteAssemblyPart";

export class FNaniteAssemblyData {
  Parts: Array<FNaniteAssemblyPart>;
  Nodes: Array<FNaniteAssemblyNode>;

  constructor(props: { Parts: Array<FNaniteAssemblyPart>; Nodes: Array<FNaniteAssemblyNode> }) {
    this.Parts = props.Parts;
    this.Nodes = props.Nodes;
  }
}
