// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FAnimPhysObjectVersion {
  // region Introduced with UE 4.16.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  /// convert animnode look at to use just default axis instead of enum, which doesn't do much
  ConvertAnimNodeLookAtAxis = 1,
  /// Change FKSphylElem and FKBoxElem to use Rotators not Quats for easier editing
  BoxSphylElemsUseRotators = 2,
  /// Change thumbnail scene info and asset import data to be transactional
  ThumbnailSceneInfoAndAssetImportDataAreTransactional = 3,
  // endregion

  // region Introduced with UE 4.17.0
  /// Enabled clothing masks rather than painting parameters directly
  AddedClothingMaskWorkflow = 4,
  /// Remove UID from smart name serialize, it just breaks determinism
  RemoveUIDFromSmartNameSerialize = 5,
  /// Convert FName Socket to FSocketReference and added TargetReference that support bone and socket
  CreateTargetReference = 6,
  /// Tune soft limit stiffness and damping coefficients
  TuneSoftLimitStiffnessAndDamping = 7,
  // endregion

  // region Introduced with UE 4.18.0
  /// Fix possible inf/nans in clothing particle masses
  FixInvalidClothParticleMasses = 8,
  /// Moved influence count to cached data
  CacheClothMeshInfluences = 9,
  /// Remove GUID from Smart Names entirely + remove automatic name fixup
  SmartNameRefactorForDeterministicCooking = 10,
  /// rename the variable and allow individual curves to be set
  RenameDisableAnimCurvesToAllowAnimCurveEvaluation = 11,
  /// link curve to LOD, so curve metadata has to include LODIndex
  AddLODToCurveMetaData = 12,
  // endregion

  // region Introduced with UE 4.19.0
  /// Fixed blend profile references persisting after paste when they aren't compatible
  FixupBadBlendProfileReferences = 13,
  /// Allowing multiple audio plugin settings
  AllowMultipleAudioPluginSettings = 14,
  /// Change RetargetSource reference to SoftObjectPtr
  ChangeRetargetSourceReferenceToSoftObjectPtr = 15,
  /// Save editor only full pose for pose asset
  SaveEditorOnlyFullPoseForPoseAsset = 16,
  // endregion

  // region Introduced with UE 4.20.0
  /// Asset change and cleanup to facilitate new streaming system
  GeometryCacheAssetDeprecation = 17,
  // endregion
}

export const FAnimPhysObjectVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made",
    value: 0,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "ConvertAnimNodeLookAtAxis",
    comment: "convert animnode look at to use just default axis instead of enum, which doesn't do much",
    value: 1,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "BoxSphylElemsUseRotators",
    comment: "Change FKSphylElem and FKBoxElem to use Rotators not Quats for easier editing",
    value: 2,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "ThumbnailSceneInfoAndAssetImportDataAreTransactional",
    comment: "Change thumbnail scene info and asset import data to be transactional",
    value: 3,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "AddedClothingMaskWorkflow",
    comment: "Enabled clothing masks rather than painting parameters directly",
    value: 4,
    firstAppearance: "4.17.0",
  }),
  new VersionDetails({
    name: "RemoveUIDFromSmartNameSerialize",
    comment: "Remove UID from smart name serialize, it just breaks determinism ",
    value: 5,
    firstAppearance: "4.17.0",
  }),
  new VersionDetails({
    name: "CreateTargetReference",
    comment: "Convert FName Socket to FSocketReference and added TargetReference that support bone and socket",
    value: 6,
    firstAppearance: "4.17.0",
  }),
  new VersionDetails({
    name: "TuneSoftLimitStiffnessAndDamping",
    comment: "Tune soft limit stiffness and damping coefficients",
    value: 7,
    firstAppearance: "4.17.0",
  }),
  new VersionDetails({
    name: "FixInvalidClothParticleMasses",
    comment: "Fix possible inf/nans in clothing particle masses",
    value: 8,
    firstAppearance: "4.18.0",
  }),
  new VersionDetails({
    name: "CacheClothMeshInfluences",
    comment: "Moved influence count to cached data",
    value: 9,
    firstAppearance: "4.18.0",
  }),
  new VersionDetails({
    name: "SmartNameRefactorForDeterministicCooking",
    comment: "Remove GUID from Smart Names entirely + remove automatic name fixup",
    value: 10,
    firstAppearance: "4.18.0",
  }),
  new VersionDetails({
    name: "RenameDisableAnimCurvesToAllowAnimCurveEvaluation",
    comment: "rename the variable and allow individual curves to be set",
    value: 11,
    firstAppearance: "4.18.0",
  }),
  new VersionDetails({
    name: "AddLODToCurveMetaData",
    comment: "link curve to LOD, so curve metadata has to include LODIndex",
    value: 12,
    firstAppearance: "4.18.0",
  }),
  new VersionDetails({
    name: "FixupBadBlendProfileReferences",
    comment: "Fixed blend profile references persisting after paste when they aren't compatible",
    value: 13,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "AllowMultipleAudioPluginSettings",
    comment: "Allowing multiple audio plugin settings",
    value: 14,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "ChangeRetargetSourceReferenceToSoftObjectPtr",
    comment: "Change RetargetSource reference to SoftObjectPtr",
    value: 15,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "SaveEditorOnlyFullPoseForPoseAsset",
    comment: "Save editor only full pose for pose asset ",
    value: 16,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "GeometryCacheAssetDeprecation",
    comment: "Asset change and cleanup to facilitate new streaming system",
    value: 17,
    firstAppearance: "4.20.0",
  }),
];
