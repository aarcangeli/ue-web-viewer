import { AssetReader } from "../AssetReader";
import { FPackageFileSummary } from "./PackageFileSummary";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../enums";

/**
 * struct FObjectImport {
 *     // FObjectResource
 *     FName ObjectName;
 *     FPackageIndex OuterIndex;
 *     // FObjectImport
 *     FName ClassPackage;
 *     FName ClassName;
 *     FName PackageName;
 *     bool bImportOptional;
 * };
 */
export class FObjectImport {
  ClassPackage: string = "";
  ClassName: string = "";
  OuterIndex: number = 0;
  ObjectName: string = "";
  PackageName: string = "";
  bImportOptional: boolean = false;

  static fromStream(reader: AssetReader) {
    const result = new FObjectImport();
    result.ClassPackage = reader.readFName();
    result.ClassName = reader.readFName();
    result.OuterIndex = reader.readInt32();
    result.ObjectName = reader.readFName();

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_NON_OUTER_PACKAGE_IMPORT) {
      result.PackageName = reader.readFName();
    }

    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.OPTIONAL_RESOURCES) {
      result.bImportOptional = reader.readBoolean();
    }

    return result;
  }
}
