import { FGuid } from "./Guid";
import { AssetReader } from "../AssetReader";
import { ECustomVersionSerializationFormat } from "../enums";

/**
 * struct FCustomVersion {
 *     FGuid Key;
 *     int32 Version{0};
 *     FString FriendlyName;
 * };
 */
export class FCustomVersion {
  Key: FGuid = new FGuid();
  Version: number = 0;
  FriendlyName: string = "";

  static fromStream(reader: AssetReader, format: ECustomVersionSerializationFormat) {
    const result = new FCustomVersion();
    switch (format) {
      case ECustomVersionSerializationFormat.Enums:
        const value = reader.readUInt32();
        result.Key = FGuid.fromComponents(0, 0, 0, value);
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
