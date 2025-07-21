import type { FName } from "../../../types/Name";
import { NAME_None } from "../../../types/Name";
import type { UMaterialInterface } from "../objects/MaterialInterface";
import { FMeshUVChannelInfo } from "./MeshUVChannelInfo";

export class FStaticMaterial {
  MaterialInterface: UMaterialInterface | null = null;
  MaterialSlotName: FName = NAME_None;
  ImportedMaterialSlotName: FName = NAME_None;
  UVChannelData: FMeshUVChannelInfo = new FMeshUVChannelInfo();
  OverlayMaterialInterface: UMaterialInterface | null = null;
}
