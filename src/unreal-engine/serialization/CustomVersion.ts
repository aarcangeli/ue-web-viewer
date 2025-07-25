import type { AssetReader } from "../AssetReader";
import { FGuid, GUID_None } from "../modules/CoreUObject/structs/Guid";

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
  readonly Versions: ReadonlyArray<FCustomVersion> = [];

  static fromStream(reader: AssetReader, format: ECustomVersionSerializationFormat) {
    const versions: Array<FCustomVersion> = [];
    const count = reader.readUInt32();
    for (let i = 0; i < count; i++) {
      versions.push(FCustomVersion.fromStream(reader, format));
    }
    return new FCustomVersionContainer(versions);
  }

  constructor(Versions: ReadonlyArray<FCustomVersion>) {
    this.Versions = Versions;
  }
}
