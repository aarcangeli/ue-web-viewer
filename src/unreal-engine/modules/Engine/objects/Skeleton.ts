import { type ObjectResolver, UObject } from "../../CoreUObject/objects/Object";
import { RegisterClass } from "../../../types/class-registry";
import { type FBoneNode } from "../structs/BoneNode";
import { FTransform } from "../../CoreUObject/structs/Transform";
import { EAxis } from "../../CoreUObject/enums/EAxis";
import { FGuid, GUID_None } from "../../CoreUObject/structs/Guid";
import { type FVirtualBone } from "../structs/VirtualBone";
import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";
import { type USkeletalMeshSocket } from "./SkeletalMeshSocket";
import { FSmartNameContainer } from "../structs/SmartNameContainer";
import { type UBlendProfile } from "./BlendProfile";
import { type FAnimSlotGroup } from "../structs/AnimSlotGroup";
import { type FName, FNameMap, NAME_None } from "../../../types/Name";
import { FPreviewAssetAttachContainer } from "../structs/PreviewAssetAttachContainer";
import { type UAssetUserData } from "./AssetUserData";
import type { AssetReader } from "../../../AssetReader";
import { EUnrealEngineObjectUE4Version } from "../../../versioning/ue-versions";
import { FColor } from "../../CoreUObject/structs/Color";
import {
  FAnimPhysObjectVersion,
  FAnimPhysObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FAnimPhysObjectVersion";
import {
  FFrameworkObjectVersion,
  FFrameworkObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FFrameworkObjectVersion";

@RegisterClass("/Script/Engine.Skeleton")
export class USkeleton extends UObject {
  BoneTree: Array<FBoneNode> = [];
  RefLocalPoses: Array<FTransform> = [];
  PreviewForwardAxis: EAxis = EAxis.None;
  VirtualBoneGuid: FGuid = GUID_None;
  VirtualBones: Array<FVirtualBone> = [];
  CompatibleSkeletons: Array<FSoftObjectPath> = [];
  bUseRetargetModesFromCompatibleSkeleton: boolean = false;
  Sockets: Array<USkeletalMeshSocket | null> = [];
  SmartNames: FSmartNameContainer = new FSmartNameContainer();
  BlendProfiles: Array<UBlendProfile | null> = [];
  SlotGroups: Array<FAnimSlotGroup> = [];
  PreviewSkeletalMesh: FSoftObjectPath = new FSoftObjectPath();
  AdditionalPreviewSkeletalMeshes: FSoftObjectPath = new FSoftObjectPath();
  AnimationNotifies: Array<FName> = [];
  PreviewAttachedAssetContainer: FPreviewAssetAttachContainer = new FPreviewAssetAttachContainer();
  AssetUserData: Array<UAssetUserData | null> = [];
  AssetUserDataEditorOnly: Array<UAssetUserData | null> = [];

  // Native serialized properties
  ReferenceSkeleton: FReferenceSkeleton = new FReferenceSkeleton();

  deserialize(reader: AssetReader, resolver: ObjectResolver) {
    super.deserialize(reader, resolver);

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_REFERENCE_SKELETON_REFACTOR) {
      this.ReferenceSkeleton = FReferenceSkeleton.fromStream(reader, resolver);
    }
  }
}

export class FReferenceSkeleton {
  RawRefBoneInfo: FMeshBoneInfo[] = [];
  RawRefBonePose: FTransform[] = [];
  RawNameToIndexMap: FNameMap<number> = new FNameMap<number>();
  AnimRetargetSources: FNameMap<FReferencePose> = new FNameMap<FReferencePose>();
  Guid: FGuid = GUID_None;
  SmartNames: FNameMap<FSmartNameMapping> = new FNameMap<FSmartNameMapping>();

  static fromStream(reader: AssetReader, resolver: ObjectResolver) {
    const result = new FReferenceSkeleton();
    result.RawRefBoneInfo = reader.readArray(() => FMeshBoneInfo.fromStream(reader));
    result.RawRefBonePose = reader.readArray(() => FTransform.fromStream(reader));

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_REFERENCE_SKELETON_REFACTOR) {
      result.RawNameToIndexMap = reader.readNameMap(() => reader.readInt32());
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_FIX_ANIMATIONBASEPOSE_SERIALIZATION) {
      result.AnimRetargetSources = reader.readNameMap(() => FReferencePose.fromStream(reader, resolver));
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_SKELETON_GUID_SERIALIZATION) {
      result.Guid = FGuid.fromStream(reader);
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_SKELETON_ADD_SMARTNAMES) {
      result.SmartNames = reader.readNameMap(() => FSmartNameMapping.fromStream(reader));
    }

    // todo: continue
    return result;
  }
}

export class FMeshBoneInfo {
  Name: FName = NAME_None;
  ParentIndex: number = -1;
  ExportName: string = "";

  static fromStream(reader: AssetReader): FMeshBoneInfo {
    const result = new FMeshBoneInfo();
    result.Name = reader.readName();
    result.ParentIndex = reader.readInt32();

    if (reader.fileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_REFERENCE_SKELETON_REFACTOR) {
      // Deprecated FColor BoneColor
      FColor.fromStream(reader);
    }

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_STORE_BONE_EXPORT_NAMES) {
      result.ExportName = reader.readString();
    }

    return result;
  }

  get summary(): string {
    return this.ExportName || this.Name.toString();
  }
}

export class FReferencePose {
  PoseName: FName = NAME_None;
  PoseBones: FTransform[] = [];
  SourceReferenceMesh: FSoftObjectPath = new FSoftObjectPath(); // USkeletalMesh

  static fromStream(reader: AssetReader, resolver: ObjectResolver): FReferencePose {
    const result = new FReferencePose();
    result.PoseName = reader.readName();
    result.PoseBones = reader.readArray(() => FTransform.fromStream(reader));

    if (
      reader.getCustomVersion(FAnimPhysObjectVersionGuid) <
      FAnimPhysObjectVersion.ChangeRetargetSourceReferenceToSoftObjectPtr
    ) {
      const sourceReferenceMesh = resolver.readObjectPtr(reader);
      if (sourceReferenceMesh) {
        result.SourceReferenceMesh = FSoftObjectPath.fromObject(sourceReferenceMesh);
      }
    } else {
      result.SourceReferenceMesh = resolver.readSoftObjectPtr(reader);
    }

    return result;
  }
}

export class FSmartNameMapping {
  CurveMetaDataMap: FNameMap<FCurveMetaData> = new FNameMap<FCurveMetaData>();

  static fromStream(reader: AssetReader): FSmartNameMapping {
    const result = new FSmartNameMapping();

    // Skip deprecated fields
    if (reader.getCustomVersion(FFrameworkObjectVersionGuid) >= FFrameworkObjectVersion.SmartNameRefactor) {
      if (
        reader.getCustomVersion(FAnimPhysObjectVersionGuid) <
        FAnimPhysObjectVersion.SmartNameRefactorForDeterministicCooking
      ) {
        reader.readNameMap(() => FGuid.fromStream(reader));
      }
    } else if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_SKELETON_ADD_SMARTNAMES) {
      reader.readUInt16();
      reader.readArray(() => {
        reader.readUInt16();
        reader.readName();
      });
    }

    if (reader.getCustomVersion(FFrameworkObjectVersionGuid) >= FFrameworkObjectVersion.MoveCurveTypesToSkeleton) {
      result.CurveMetaDataMap = reader.readNameMap(() => FCurveMetaData.fromStream(reader));
    }

    return result;
  }
}

export class FCurveMetaData {
  bMaterial: boolean = false;
  bMorphTarget: boolean = false;
  LinkedBones: FName[] = [];
  MaxLOD: number = -1;

  static fromStream(reader: AssetReader): FCurveMetaData {
    const result = new FCurveMetaData();
    result.bMaterial = reader.readBoolean();
    result.bMorphTarget = reader.readBoolean();
    result.LinkedBones = reader.readArray(() => reader.readName());

    if (reader.getCustomVersion(FAnimPhysObjectVersionGuid) >= FAnimPhysObjectVersion.AddLODToCurveMetaData) {
      result.MaxLOD = reader.readUInt8();
    }

    return result;
  }
}
