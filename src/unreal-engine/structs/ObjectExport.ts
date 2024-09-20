import { AssetReader } from "../AssetReader";
import { FPackageFileSummary } from "./PackageFileSummary";
import { FGuid } from "./Guid";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../versions";

export class FObjectExport {
  ClassIndex: number = 0;
  SuperIndex: number = 0;
  TemplateIndex: number = 0;
  OuterIndex: number = 0;
  ObjectName: string = "";
  objectFlags: number = 0;
  SerialSize: number = 0;
  SerialOffset: number = 0;
  bForcedExport: boolean = false;
  bNotForClient: boolean = false;
  bNotForServer: boolean = false;
  bIsInheritedInstance: boolean = false;
  packageFlags: number = 0;
  bNotAlwaysLoadedForEditorGame: boolean = false;
  bIsAsset: boolean = false;
  bGeneratePublicHash: boolean = false;

  FirstExportDependency: number = 0;
  SerializationBeforeSerializationDependencies: number = 0;
  CreateBeforeSerializationDependencies: number = 0;
  SerializationBeforeCreateDependencies: number = 0;
  CreateBeforeCreateDependencies: number = 0;

  ScriptSerializationStartOffset: number = 0;
  ScriptSerializationEndOffset: number = 0;

  static fromStream(reader: AssetReader) {
    const result = new FObjectExport();
    result.ClassIndex = reader.readInt32();
    result.SuperIndex = reader.readInt32();

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_TemplateIndex_IN_COOKED_EXPORTS) {
      result.TemplateIndex = reader.readInt32();
    }

    result.OuterIndex = reader.readInt32();
    result.ObjectName = reader.readFName();

    result.objectFlags = reader.readUInt32();

    // SerialSize and SerialOffset are 32 bits before this version
    if (reader.fileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_64BIT_EXPORTMAP_SERIALSIZES) {
      result.SerialSize = reader.readInt32();
      result.SerialOffset = reader.readInt32();
    } else {
      result.SerialSize = reader.readInt64();
      result.SerialOffset = reader.readInt64();
    }

    result.bForcedExport = reader.readBoolean();
    result.bNotForClient = reader.readBoolean();
    result.bNotForServer = reader.readBoolean();

    // removed after this version
    if (reader.fileVersionUE5 < EUnrealEngineObjectUE5Version.REMOVE_OBJECT_EXPORT_PACKAGE_GUID) {
      FGuid.fromStream(reader);
    }

    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.TRACK_OBJECT_EXPORT_IS_INHERITED) {
      result.bIsInheritedInstance = reader.readBoolean();
    }

    result.packageFlags = reader.readUInt32();

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_LOAD_FOR_EDITOR_GAME) {
      result.bNotAlwaysLoadedForEditorGame = reader.readBoolean();
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_COOKED_ASSETS_IN_EDITOR_SUPPORT) {
      result.bIsAsset = reader.readBoolean();
    }

    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.OPTIONAL_RESOURCES) {
      result.bGeneratePublicHash = reader.readBoolean();
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PRELOAD_DEPENDENCIES_IN_COOKED_EXPORTS) {
      result.FirstExportDependency = reader.readInt32();
      result.SerializationBeforeSerializationDependencies = reader.readInt32();
      result.CreateBeforeSerializationDependencies = reader.readInt32();
      result.SerializationBeforeCreateDependencies = reader.readInt32();
      result.CreateBeforeCreateDependencies = reader.readInt32();
    }

    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.SCRIPT_SERIALIZATION_OFFSET) {
      result.ScriptSerializationStartOffset = reader.readUInt64();
      result.ScriptSerializationEndOffset = reader.readUInt64();
    }

    return result;
  }
}
