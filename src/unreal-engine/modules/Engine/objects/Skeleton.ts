import { type ObjectResolver, UObject } from "../../CoreUObject/objects/Object";
import { RegisterClass } from "../../../types/class-registry";
import { type FBoneNode } from "../structs/BoneNode";
import { type FTransform } from "../../CoreUObject/structs/Transform";
import { EAxis } from "../../CoreUObject/enums/EAxis";
import { type FGuid, GUID_None } from "../../CoreUObject/structs/Guid";
import { type FVirtualBone } from "../structs/VirtualBone";
import { FSoftObjectPath } from "../../CoreUObject/structs/SoftObjectPath";
import { type USkeletalMeshSocket } from "./SkeletalMeshSocket";
import { FSmartNameContainer } from "../structs/SmartNameContainer";
import { type UBlendProfile } from "./BlendProfile";
import { type FAnimSlotGroup } from "../structs/AnimSlotGroup";
import { type FName } from "../../../types/Name";
import { FPreviewAssetAttachContainer } from "../structs/PreviewAssetAttachContainer";
import { type UAssetUserData } from "./AssetUserData";
import type { AssetReader } from "../../../AssetReader";

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

  deserialize(reader: AssetReader, resolver: ObjectResolver) {
    super.deserialize(reader, resolver);
  }
}
