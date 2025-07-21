import { UObject } from "../../CoreUObject/objects/Object";
import type { UAssetImportData } from "./AssetImportData";

export class UCurveBase extends UObject {
  AssetImportData: UAssetImportData | null = null;
  ImportPath: string = "";
}
