// This file is auto-generated, do not edit directly.

import type { FMeshUVChannelInfo } from "./MeshUVChannelInfo";
import type { UMaterialInterface } from "./MaterialInterface";

export class FStaticMaterial {
  MaterialInterface: UMaterialInterface;
  MaterialSlotName: string;
  ImportedMaterialSlotName: string;
  UVChannelData: FMeshUVChannelInfo;
  OverlayMaterialInterface: UMaterialInterface;

  constructor(props: {
    MaterialInterface: UMaterialInterface;
    MaterialSlotName: string;
    ImportedMaterialSlotName: string;
    UVChannelData: FMeshUVChannelInfo;
    OverlayMaterialInterface: UMaterialInterface;
  }) {
    this.MaterialInterface = props.MaterialInterface;
    this.MaterialSlotName = props.MaterialSlotName;
    this.ImportedMaterialSlotName = props.ImportedMaterialSlotName;
    this.UVChannelData = props.UVChannelData;
    this.OverlayMaterialInterface = props.OverlayMaterialInterface;
  }
}
