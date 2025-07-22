import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "../../CoreUObject/objects/Object";
import type { UAssetImportData } from "./AssetImportData";

@RegisterClass("/Script/Engine.CurveBase")
export class UCurveBase extends UObject {
  AssetImportData: UAssetImportData | null = null;
  ImportPath: string = "";
}
