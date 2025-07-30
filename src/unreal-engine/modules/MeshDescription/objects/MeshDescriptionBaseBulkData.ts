import { RegisterClass } from "../../../types/class-registry";
import type { ObjectResolver } from "../../CoreUObject/objects/Object";
import { UObject } from "../../CoreUObject/objects/Object";
import type { AssetReader } from "../../../AssetReader";
import {
  FUE5MainStreamObjectVersion,
  FUE5MainStreamObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FUE5MainStreamObjectVersion";
import invariant from "tiny-invariant";
import { FGuid, GUID_None } from "../../CoreUObject/structs/Guid";
import { FIoHash } from "../../../types/hash/IoHash";
import {
  FEditorObjectVersion,
  FEditorObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FEditorObjectVersion";
import {
  FEnterpriseObjectVersion,
  FEnterpriseObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FEnterpriseObjectVersion";
import { uncompressData } from "../../../types/compression";

@RegisterClass("/Script/MeshDescription.MeshDescriptionBaseBulkData")
export class UMeshDescriptionBaseBulkData extends UObject {
  // BulkData begin
  flags: EFlags = EFlags.None;
  bulkDataId: FGuid = GUID_None;
  payloadContentId: FIoHash = new FIoHash();
  offsetInFile: number = 0;

  // Size of the uncompressed payload in bytes.
  payloadSize: number = 0;
  // BulkData end

  guid: FGuid = GUID_None;
  guidIsHash: boolean = false;

  deserialize(reader: AssetReader, resolver: ObjectResolver) {
    super.deserialize(reader, resolver);

    const outer = this.outer;
    invariant(outer, "UMeshDescriptionBaseBulkData must have an outer");

    if (
      reader.getCustomVersion(FUE5MainStreamObjectVersionGuid) <
      FUE5MainStreamObjectVersion.VirtualizedBulkDataHaveUniqueGuids
    ) {
      // TODO: implement this
      throw new Error("TODO: FUE5MainStreamObjectVersionGuid < VirtualizedBulkDataHaveUniqueGuids");
    } else {
      this.flags = reader.readUInt32();
      this.bulkDataId = FGuid.fromStream(reader);
      this.payloadContentId = FIoHash.fromStream(reader);
      this.payloadSize = reader.readInt64();

      this.offsetInFile = 0;
      if (this.flags & EFlags.StoredInPackageTrailer) {
        throw new Error("Bulk data stored in package trailer is not supported yet");
      } else {
        if (!(this.flags & EFlags.IsVirtualized) && !(this.flags & EFlags.IsCooked)) {
          this.offsetInFile = reader.readInt64();
        }
      }
    }

    if (reader.getCustomVersion(FEditorObjectVersionGuid) >= FEditorObjectVersion.MeshDescriptionBulkDataGuid) {
      this.guid = FGuid.fromStream(reader);
    }

    if (
      reader.getCustomVersion(FEnterpriseObjectVersionGuid) >=
      FEnterpriseObjectVersion.MeshDescriptionBulkDataGuidIsHash
    ) {
      this.guidIsHash = reader.readBoolean();
    }
  }

  loadCompressedData(): Promise<Uint8Array> {
    console.log(`Loading compressed data from ${this.fullName}`);

    const reader = this.assetApi?.reader;
    invariant(reader, "UMeshDescriptionBaseBulkData must have an asset reader");
    reader.seek(this.offsetInFile);

    if (this.flags & EFlags.ReferencesLegacyFile) {
      throw new Error("UMeshDescriptionBaseBulkData does not support non-legacy files yet");
    }

    return uncompressData(reader);
  }
}

/** Flags used to store additional meta information about the bulk data */
enum EFlags {
  /** No flags are set */
  None = 0,
  /** Is the data actually virtualized or not? */
  IsVirtualized = 1 << 0,
  /** Does the package have access to a .upayload file? */
  HasPayloadSidecarFile = 1 << 1,
  /** The bulkdata object is currently referencing a payload saved under old bulkdata formats */
  ReferencesLegacyFile = 1 << 2,
  /** The legacy file being referenced is stored with Zlib compression format */
  LegacyFileIsCompressed = 1 << 3,
  /** The payload should not have compression applied to it. It is assumed that the payload is already
   in some sort of compressed format, see the compression documentation above for more details. */
  DisablePayloadCompression = 1 << 4,
  /** The legacy file being referenced derived its key from guid and it should be replaced with a key-from-hash when saved */
  LegacyKeyWasGuidDerived = 1 << 5,
  /** (Transient) The Guid has been registered with the BulkDataRegistry */
  HasRegistered = 1 << 6,
  /** (Transient) The BulkData object is a copy used only to represent the id and payload; it does not communicate with the BulkDataRegistry, and will point DDC jobs toward the original BulkData */
  IsTornOff = 1 << 7,
  /** The bulkdata object references a payload stored in a WorkspaceDomain file  */
  ReferencesWorkspaceDomain = 1 << 8,
  /** The payload is stored in a package trailer, so the bulkdata object will have to poll the trailer to find the payload offset */
  StoredInPackageTrailer = 1 << 9,
  /** The bulkdata object was cooked. */
  IsCooked = 1 << 10,
  /** (Transient) The package owning the bulkdata has been detached from disk and we can no longer load from it */
  WasDetached = 1 << 11,
}
