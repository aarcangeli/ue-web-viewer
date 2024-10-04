import { FGuid, GUID_None } from "../objects/CoreUObject/Guid";
import { AssetReader } from "../AssetReader";

/**
 * enum class ECustomVersionSerializationFormat : int8 {
 *     Unknown,
 *     Guids = 1,
 *     Enums = 2,
 *     Optimized = 3,
 * };
 */
export enum ECustomVersionSerializationFormat {
  Unknown,
  Guids,
  Enums,
  Optimized,
}

/**
 * struct FCustomVersion {
 *     FGuid Key;
 *     int32 Version{0};
 *     FString FriendlyName;
 * };
 */
export class FCustomVersion {
  Key: FGuid = GUID_None;
  Version: number = 0;
  FriendlyName: string = "";

  static fromStream(reader: AssetReader, format: ECustomVersionSerializationFormat) {
    const result = new FCustomVersion();
    switch (format) {
      case ECustomVersionSerializationFormat.Enums:
        result.Key = FGuid.fromComponents(0, 0, 0, reader.readUInt32());
        result.Version = reader.readInt32();
        result.FriendlyName = `__EnumTag__${result.Key.toString()}`;
        break;

      case ECustomVersionSerializationFormat.Guids:
        result.Key = FGuid.fromStream(reader);
        result.Version = reader.readInt32();
        result.FriendlyName = reader.readString();
        break;

      case ECustomVersionSerializationFormat.Optimized:
        result.Key = FGuid.fromStream(reader);
        result.Version = reader.readInt32();
        break;

      default:
        throw new Error("Unknown custom version serialization format");
    }

    return result;
  }
}

/**
 * struct FCustomVersionContainer {
 *     std::vector<FCustomVersion> Versions;
 * };
 */
export class FCustomVersionContainer {
  Versions: FCustomVersion[] = [];

  static fromStream(reader: AssetReader, format: ECustomVersionSerializationFormat) {
    const result = new FCustomVersionContainer();
    const count = reader.readUInt32();
    for (let i = 0; i < count; i++) {
      result.Versions.push(FCustomVersion.fromStream(reader, format));
    }
    return result;
  }
}
