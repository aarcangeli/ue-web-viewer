import { AssetReader } from "./AssetReader";
import {
  ECustomVersionSerializationFormat,
  EPackageFlags,
  EUnrealEngineObjectUE4Version,
  EUnrealEngineObjectUE5Version,
} from "./enums";

/**
 * struct FGuid {
 *     uint32 A{};
 *     uint32 B{};
 *     uint32 C{};
 *     uint32 D{};
 * };
 */
export class FGuid {
  A: number = 0;
  B: number = 0;
  C: number = 0;
  D: number = 0;

  static fromComponents(A: number, B: number, C: number, D: number) {
    const result = new FGuid();
    result.A = A;
    result.B = B;
    result.C = C;
    result.D = D;
    return result;
  }

  static fromString(str: string) {
    const result = new FGuid();
    const match = str.match(/{([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})}/);
    if (!match) {
      throw new Error("Invalid GUID string");
    }
    result.A = parseInt(match[1], 16);
    result.B = ((parseInt(match[2], 16) << 16) | parseInt(match[3], 16)) >>> 0;
    result.C = ((parseInt(match[4], 16) << 16) | parseInt(match[5].substring(0, 4), 16)) >>> 0;
    result.D = parseInt(match[5].substring(4), 16);
    return result;
  }

  static fromStream(reader: AssetReader) {
    const result = new FGuid();
    result.A = reader.readUInt32();
    result.B = reader.readUInt32();
    result.C = reader.readUInt32();
    result.D = reader.readUInt32();
    return result;
  }

  get string() {
    return this.toString();
  }

  toString() {
    return `{${this.A.toString(16).padStart(8, "0")}-${(this.B >>> 16).toString(16).padStart(4, "0")}-${(
      this.B & 0xffff
    )
      .toString(16)
      .padStart(4, "0")}-${(this.C >>> 16).toString(16).padStart(4, "0")}-${(this.C & 0xffff)
      .toString(16)
      .padStart(4, "0")}${this.D.toString(16).padStart(8, "0")}}`;
  }
}

/**
 * struct FEngineVersion {
 *     uint16 Major{};
 *     uint16 Minor{};
 *     uint16 Patch{};
 *     uint32 Changelist{};
 *     FString Branch;
 * };
 */
export class FEngineVersion {
  Major: number = 0;
  Minor: number = 0;
  Patch: number = 0;
  Changelist: number = 0;
  Branch: string = "";

  static fromStream(reader: AssetReader) {
    const result = new FEngineVersion();
    result.Major = reader.readUInt16();
    result.Minor = reader.readUInt16();
    result.Patch = reader.readUInt16();
    result.Changelist = reader.readUInt32();
    result.Branch = reader.readString();
    return result;
  }

  static fromComponents(major: number, minor: number, patch: number, changelist: number, branch: string) {
    const result = new FEngineVersion();
    result.Major = major;
    result.Minor = minor;
    result.Patch = patch;
    result.Changelist = changelist;
    result.Branch = branch;
    return result;
  }
}

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

/**
 * struct FGenerationInfo {
 *    int32 ExportCount;
 *    int32 NameCount;
 *  };
 */
export class FGenerationInfo {
  ExportCount: number = 0;
  NameCount: number = 0;

  static fromStream(reader: AssetReader) {
    const result = new FGenerationInfo();
    result.ExportCount = reader.readInt32();
    result.NameCount = reader.readInt32();
    return result;
  }
}

/**
 * This is the header of all package files.
 * It is not required to sync with UE4's FPackageFileSummary, since we don't use it for serialization and
 * new fields are usually added at the end.
 */
export class FPackageFileSummary {
  static PACKAGE_FILE_TAG = 0x9e2a83c1;
  static PACKAGE_FILE_TAG_SWAPPED = 0xc1832a9e;

  // part 1: magic code and version numbers
  Tag: number = FPackageFileSummary.PACKAGE_FILE_TAG;
  LegacyFileVersion: number = 0;
  FileVersionUE4: number = 0;
  FileVersionUE5: number = 0;
  FileVersionLicenseeUE: number = 0;
  CustomVersionContainer: FCustomVersionContainer = new FCustomVersionContainer();

  // part 2: basic information
  TotalHeaderSize: number = 0;
  PackageName: string = "";
  PackageFlags: number = 0;

  // part 3: offset and count of various tables
  NameCount: number = 0;
  NameOffset: number = 0;

  SoftObjectPathsCount: number = 0;
  SoftObjectPathsOffset: number = 0;

  GatherableTextDataCount: number = 0;
  GatherableTextDataOffset: number = 0;

  ExportCount: number = 0;
  ExportOffset: number = 0;

  ImportCount: number = 0;
  ImportOffset: number = 0;

  DependsOffset: number = 0;

  SoftPackageReferencesCount: number = 0;
  SoftPackageReferencesOffset: number = 0;

  SearchableNamesOffset: number = 0;

  ThumbnailTableOffset: number = 0;

  // part 4: more header fields and versioning

  // deprecated in 4.27
  // UPackage::Guid has not been used by the engine for a long time and FPackageFileSummary::Guid will be removed
  Guid: FGuid = new FGuid();

  PersistentGuid: FGuid = new FGuid();
  LocalizationId: string = "";

  Generations: FGenerationInfo[] = [];

  SavedByEngineVersion: FEngineVersion = new FEngineVersion();
  CompatibleWithEngineVersion: FEngineVersion = new FEngineVersion();

  CompressionFlags: number = 0;
  PackageSource: number = 0;

  AssetRegistryDataOffset: number = 0;
  BulkDataStartOffset: number = 0;

  WorldTileInfoDataOffset: number = 0;

  ChunkIDs: number[] = [];

  PreloadDependencyCount: number = 0;
  PreloadDependencyOffset: number = 0;

  static fromStream(reader: AssetReader) {
    // Extracted from void operator<<(FStructuredArchive::FSlot Slot, FPackageFileSummary& Sum)
    const result = new FPackageFileSummary();

    // part 1: magic code and version numbers

    result.Tag = reader.readUInt32();

    if (result.Tag === FPackageFileSummary.PACKAGE_FILE_TAG) {
      // Do nothing
    } else if (result.Tag === FPackageFileSummary.PACKAGE_FILE_TAG_SWAPPED) {
      result.Tag = FPackageFileSummary.PACKAGE_FILE_TAG;
      reader.swapEndian();
    } else {
      throw new Error("Invalid package file tag");
    }

    /// positive number for UE1-UE3; negative for UE4+; < -8 for UE5
    result.LegacyFileVersion = reader.readInt32();
    if (result.LegacyFileVersion >= 0) {
      throw new Error(`Unreal Engine 1-3 packages are not supported: ${result.LegacyFileVersion}`);
    }
    if (result.LegacyFileVersion < -8) {
      // Probably UE6
      throw new Error(`Too futuristic file version: ${result.LegacyFileVersion}`);
    }

    if (result.LegacyFileVersion !== -4) {
      // Ignore FileVersionUE3
      reader.readInt32();
    }

    result.FileVersionUE4 = reader.readInt32();

    if (result.LegacyFileVersion === -8) {
      result.FileVersionUE5 = reader.readInt32();
    }

    result.FileVersionLicenseeUE = reader.readInt32();

    if (result.LegacyFileVersion <= -2) {
      let format: ECustomVersionSerializationFormat;
      switch (result.LegacyFileVersion) {
        case -2:
          format = ECustomVersionSerializationFormat.Enums;
          break;
        case -3:
        case -4:
        case -5:
          format = ECustomVersionSerializationFormat.Guids;
          break;
        default:
          // less than -5 (future versions)
          format = ECustomVersionSerializationFormat.Optimized;
          break;
      }
      result.CustomVersionContainer = FCustomVersionContainer.fromStream(reader, format);
    }

    if (!result.FileVersionUE4 && !result.FileVersionUE5 && !result.FileVersionLicenseeUE) {
      throw new Error("Unversioned package file are not supported in this viewer");
    }

    // part 2: basic information

    result.TotalHeaderSize = reader.readInt32();
    result.PackageName = reader.readString();
    result.PackageFlags = reader.readUInt32();

    if (result.PackageFlags & EPackageFlags.PKG_FilterEditorOnly) {
      throw new Error("Editor-only are filtered out, which is not supported in this viewer");
    }

    // part 3: offset and count of various tables

    result.NameCount = reader.readInt32();
    result.NameOffset = reader.readInt32();

    if (result.FileVersionUE5 >= EUnrealEngineObjectUE5Version.ADD_SOFTOBJECTPATH_LIST) {
      result.SoftObjectPathsCount = reader.readInt32();
      result.SoftObjectPathsOffset = reader.readInt32();
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_SUMMARY_LOCALIZATION_ID) {
      result.LocalizationId = reader.readString();
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_SERIALIZE_TEXT_IN_PACKAGES) {
      result.GatherableTextDataCount = reader.readInt32();
      result.GatherableTextDataOffset = reader.readInt32();
    }

    result.ExportCount = reader.readInt32();
    result.ExportOffset = reader.readInt32();

    result.ImportCount = reader.readInt32();
    result.ImportOffset = reader.readInt32();

    result.DependsOffset = reader.readInt32();

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADD_STRING_ASSET_REFERENCES_MAP) {
      result.SoftPackageReferencesCount = reader.readInt32();
      result.SoftPackageReferencesOffset = reader.readInt32();
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_SEARCHABLE_NAMES) {
      result.SearchableNamesOffset = reader.readInt32();
    }

    result.ThumbnailTableOffset = reader.readInt32();

    // part 4: more header fields and versioning

    result.Guid = FGuid.fromStream(reader);

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_OWNER) {
      result.PersistentGuid = FGuid.fromStream(reader);
    } else {
      result.PersistentGuid = result.Guid;
    }

    // The owner persistent guid was added in VER_UE4_ADDED_PACKAGE_OWNER but removed in the next version VER_UE4_NON_OUTER_PACKAGE_IMPORT
    if (
      result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_PACKAGE_OWNER &&
      result.FileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_NON_OUTER_PACKAGE_IMPORT
    ) {
      // Ignore outer guid
      FGuid.fromStream(reader);
    }

    const generationCount = reader.readInt32();
    for (let i = 0; i < generationCount; i++) {
      result.Generations.push(FGenerationInfo.fromStream(reader));
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ENGINE_VERSION_OBJECT) {
      result.SavedByEngineVersion = FEngineVersion.fromStream(reader);
    } else {
      const EngineChangelist = reader.readInt32();
      if (EngineChangelist !== 0) {
        result.SavedByEngineVersion = FEngineVersion.fromComponents(4, 0, 0, EngineChangelist, "");
      }
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PACKAGE_SUMMARY_HAS_COMPATIBLE_ENGINE_VERSION) {
      result.CompatibleWithEngineVersion = FEngineVersion.fromStream(reader);
    } else {
      result.CompatibleWithEngineVersion = result.SavedByEngineVersion;
    }

    result.CompressionFlags = reader.readUInt32();

    const compressedChunks = reader.readInt32();
    if (compressedChunks > 0) {
      // This is not supported in UE5 because it is cooked
      throw new Error("Compressed chunks are not supported");
    }

    result.PackageSource = reader.readUInt32();

    // AdditionalPackagesToCook is no longer used in UE5
    const additionalPackagesToCook = reader.readInt32();
    for (let i = 0; i < additionalPackagesToCook; i++) {
      reader.readString();
    }

    if (result.LegacyFileVersion > -7) {
      const NumTextureAllocations = reader.readInt32();
      if (NumTextureAllocations > 0) {
        // from UE: We haven't used texture allocation info for ages and it's no longer supported anyway
        throw new Error("Texture allocations are not supported");
      }
    }

    result.AssetRegistryDataOffset = reader.readInt32();
    result.BulkDataStartOffset = reader.readInt64();

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_WORLD_LEVEL_INFO) {
      result.WorldTileInfoDataOffset = reader.readInt32();
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_CHANGED_CHUNKID_TO_BE_AN_ARRAY_OF_CHUNKIDS) {
      const count = reader.readInt32();
      const chunkIds = [];
      for (let i = 0; i < count; i++) {
        chunkIds.push(reader.readInt32());
      }
      result.ChunkIDs = chunkIds;
    } else if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_CHUNKID_TO_ASSETDATA_AND_UPACKAGE) {
      const chunkId = reader.readInt32();
      if (chunkId >= 0) {
        result.ChunkIDs = [chunkId];
      }
    }

    if (result.FileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PRELOAD_DEPENDENCIES_IN_COOKED_EXPORTS) {
      result.PreloadDependencyCount = reader.readInt32();
      result.PreloadDependencyOffset = reader.readInt32();
    } else {
      result.PreloadDependencyCount = -1;
      result.PreloadDependencyOffset = 0;
    }

    return result;
  }
}
