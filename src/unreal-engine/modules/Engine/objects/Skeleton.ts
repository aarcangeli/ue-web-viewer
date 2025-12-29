import { type ObjectResolver, UObject } from "../../CoreUObject/objects/Object";
import { RegisterClass } from "../../../types/class-registry";
import { type FBoneNode } from "../structs/BoneNode";
import { type FTransform } from "../../CoreUObject/structs/Transform";
import { EAxis } from "../../CoreUObject/enums/EAxis";
import type { FGuid } from "../../CoreUObject/structs/Guid";
import { GUID_None } from "../../CoreUObject/structs/Guid";
import { type FVirtualBone } from "../structs/VirtualBone";
import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";
import { type USkeletalMeshSocket } from "./SkeletalMeshSocket";
import { FSmartNameContainer } from "../structs/SmartNameContainer";
import { type UBlendProfile } from "./BlendProfile";
import { type FAnimSlotGroup } from "../structs/AnimSlotGroup";
import { type FName, NAME_None } from "../../../types/Name";
import { FPreviewAssetAttachContainer } from "../structs/PreviewAssetAttachContainer";
import { type UAssetUserData } from "./AssetUserData";
import type { AssetReader } from "../../../AssetReader";
import { EUnrealEngineObjectUE4Version } from "../../../versioning/ue-versions";
import { FColor } from "../../CoreUObject/structs/Color";

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
      this.ReferenceSkeleton = FReferenceSkeleton.fromStream(reader);
    }
  }
}

export class FReferenceSkeleton {
  RawRefBoneInfo: FMeshBoneInfo[] = [];

  static fromStream(reader: AssetReader) {
    const result = new FReferenceSkeleton();
    result.RawRefBoneInfo = reader.readArray(() => FMeshBoneInfo.fromStream(reader));
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
