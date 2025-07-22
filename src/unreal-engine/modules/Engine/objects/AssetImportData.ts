import { RegisterClass } from "../../../types/class-registry";
import { UObject } from "../../CoreUObject/objects/Object";

export class FAssetImportInfo {}

@RegisterClass("/Script/Engine.AssetImportData")
export class UAssetImportData extends UObject {
  SourceFilePath: string = "";
  SourceFileTimestamp: string = "";
  SourceData: FAssetImportInfo = new FAssetImportInfo();
}
