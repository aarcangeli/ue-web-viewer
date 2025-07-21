import { UObject } from "../../CoreUObject/objects/Object";

export class FAssetImportInfo {}

export class UAssetImportData extends UObject {
  SourceFilePath: string = "";
  SourceFileTimestamp: string = "";
  SourceData: FAssetImportInfo = new FAssetImportInfo();
}
