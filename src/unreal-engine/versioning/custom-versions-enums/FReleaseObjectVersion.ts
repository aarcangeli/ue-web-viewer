// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FReleaseObjectVersion {
  // region Introduced with UE 4.11.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  /// Static Mesh extended bounds radius fix
  StaticMeshExtendedBoundsFix = 1,
  // endregion

  // region Introduced with UE 4.13.0
  /// Physics asset bodies are either in the sync scene or the async scene, but not both
  NoSyncAsyncPhysAsset = 2,
  /// converted to a TArray:
  LevelTransArrayConvertedToTArray = 3,
  // endregion

  // region Introduced with UE 4.14.0
  /// Add Component node templates now use their own unique naming scheme to ensure more reliable archetype lookups.
  AddComponentNodeTemplateUniqueNames = 4,
  // endregion

  // region Introduced with UE 4.15.0
  /// Fix a serialization issue with static mesh FMeshSectionInfoMap FProperty
  UPropertryForMeshSectionSerialize = 5,
  /// Existing HLOD settings screen size to screen area conversion
  ConvertHLODScreenSize = 6,
  /// Adding mesh section info data for existing billboard LOD models
  SpeedTreeBillboardSectionInfoFixup = 7,
  // endregion

  // region Introduced with UE 4.16.0
  /// Change FMovieSceneEventParameters::StructType to be a string asset reference from a TWeakObjectPtr<UScriptStruct>
  EventSectionParameterStringAssetRef = 8,
  /// Remove serialized irradiance map data from skylight.
  SkyLightRemoveMobileIrradianceMap = 9,
  // endregion

  // region Introduced with UE 4.17.0
  /// rename bNoTwist to bAllowTwist
  RenameNoTwistToAllowTwistInTwoBoneIK = 10,
  // endregion

  // region Introduced with UE 4.19.0
  /// Material layers serialization refactor
  MaterialLayersParameterSerializationRefactor = 11,
  /// Added disable flag to skeletal mesh data
  AddSkeletalMeshSectionDisable = 12,
  /// Removed objects that were serialized as part of this material feature
  RemovedMaterialSharedInputCollection = 13,
  // endregion

  // region Introduced with UE 4.20.0
  /// HISMC Cluster Tree migration to add new data
  HISMCClusterTreeMigration = 14,
  /// Default values on pins in blueprints could be saved incoherently
  PinDefaultValuesVerified = 15,
  /// During copy and paste transition getters could end up with broken state machine references
  FixBrokenStateMachineReferencesInTransitionGetters = 16,
  /// Change to MeshDescription serialization
  MeshDescriptionNewSerialization = 17,
  // endregion

  // region Introduced with UE 4.21.0
  /// Change to not clamp RGB values > 1 on linear color curves
  UnclampRGBColorCurves = 18,
  /// Bugfix for FAnimObjectVersion::LinkTimeAnimBlueprintRootDiscovery.
  LinkTimeAnimBlueprintRootDiscoveryBugFix = 19,
  /// Change trail anim node variable deprecation
  TrailNodeBlendVariableNameChange = 20,
  // endregion

  // region Introduced with UE 4.23.0
  /// Make sure the Blueprint Replicated Property Conditions are actually serialized properly.
  PropertiesSerializeRepCondition = 21,
  /// DepthOfFieldFocalDistance at 0 now disables DOF instead of DepthOfFieldFstop at 0.
  FocalDistanceDisablesDOF = 22,
  /// Removed versioning, but version entry must still exist to keep assets saved with this version loadable
  Unused_SoundClass2DReverbSend = 23,
  // endregion

  // region Introduced with UE 4.24.0
  /// Groom asset version
  GroomAssetVersion1 = 24,
  GroomAssetVersion2 = 25,
  /// Store applied version of Animation Modifier to use when reverting
  SerializeAnimModifierState = 26,
  /// Groom asset version
  GroomAssetVersion3 = 27,
  /// Upgrade filmback
  DeprecateFilmbackSettings = 28,
  // endregion

  // region Introduced with UE 4.25.0
  /// custom collision type
  CustomImplicitCollisionType = 29,
  /// FFieldPath will serialize the owner struct reference and only a short path to its property
  FFieldPathOwnerSerialization = 30,
  // endregion

  // region Introduced with UE 5.0.0
  /// This was inadvertently added in UE5. The proper version for it is in in UE5MainStreamObjectVersion
  MeshDescriptionNewFormat = 31,
  // endregion

  // region Introduced with UE 4.26.0
  /// Pin types include a flag that propagates the 'CPF_UObjectWrapper' flag to generated properties
  PinTypeIncludesUObjectWrapperFlag = 32,
  /// Added Weight member to FMeshToMeshVertData
  WeightFMeshToMeshVertData = 33,
  /// Animation graph node bindings displayed as pins
  AnimationGraphNodeBindingsDisplayedAsPins = 34,
  /// Serialized rigvm offset segment paths
  SerializeRigVMOffsetSegmentPaths = 35,
  /// Upgrade AbcGeomCacheImportSettings for velocities
  AbcVelocitiesSupport = 36,
  /// Add margin support to Chaos Convex
  MarginAddedToConvexAndBox = 37,
  /// Add structure data to Chaos Convex
  StructureDataAddedToConvex = 38,
  // endregion

  // region Introduced with UE 4.27.0
  /// Changed axis UI for LiveLink AxisSwitch Pre Processor
  AddedFrontRightUpAxesToLiveLinkPreProcessor = 39,
  /// Some sequencer event sections that were copy-pasted left broken links to the director BP
  FixupCopiedEventSections = 40,
  /// Serialize the number of bytes written when serializing function arguments
  RemoteControlSerializeFunctionArgumentsSize = 41,
  /// Add loop counters to sequencer's compiled sub-sequence data
  AddedSubSequenceEntryWarpCounter = 42,
  /// Remove default resolution limit of 512 pixels for cubemaps generated from long-lat sources
  LonglatTextureCubeDefaultMaxResolution = 43,
  // endregion

  // region Introduced with UE 5.0.0
  /// bake center of mass into chaos cache
  GeometryCollectionCacheRemovesMassToLocal = 44,
  // endregion

  // region Introduced with UE 4.26.0
  /// Dummy version to allow us to fix up the fact that ReleaseObjectVersion was changed elsewhere
  ReleaseObjectVersionFixup = 31,
  // endregion
}

export const FReleaseObjectVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made",
    value: 0,
    firstAppearance: "4.11.0",
  }),
  new VersionDetails({
    name: "StaticMeshExtendedBoundsFix",
    comment: "Static Mesh extended bounds radius fix",
    value: 1,
    firstAppearance: "4.11.0",
  }),
  new VersionDetails({
    name: "NoSyncAsyncPhysAsset",
    comment: "Physics asset bodies are either in the sync scene or the async scene, but not both",
    value: 2,
    firstAppearance: "4.13.0",
  }),
  new VersionDetails({
    name: "LevelTransArrayConvertedToTArray",
    comment: "converted to a TArray:",
    value: 3,
    firstAppearance: "4.13.0",
  }),
  new VersionDetails({
    name: "AddComponentNodeTemplateUniqueNames",
    comment:
      "Add Component node templates now use their own unique naming scheme to ensure more reliable archetype lookups.",
    value: 4,
    firstAppearance: "4.14.0",
  }),
  new VersionDetails({
    name: "UPropertryForMeshSectionSerialize",
    comment: "Fix a serialization issue with static mesh FMeshSectionInfoMap FProperty",
    value: 5,
    firstAppearance: "4.15.0",
  }),
  new VersionDetails({
    name: "ConvertHLODScreenSize",
    comment: "Existing HLOD settings screen size to screen area conversion",
    value: 6,
    firstAppearance: "4.15.0",
  }),
  new VersionDetails({
    name: "SpeedTreeBillboardSectionInfoFixup",
    comment: "Adding mesh section info data for existing billboard LOD models",
    value: 7,
    firstAppearance: "4.15.0",
  }),
  new VersionDetails({
    name: "EventSectionParameterStringAssetRef",
    comment:
      "Change FMovieSceneEventParameters::StructType to be a string asset reference from a TWeakObjectPtr<UScriptStruct>",
    value: 8,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "SkyLightRemoveMobileIrradianceMap",
    comment: "Remove serialized irradiance map data from skylight.",
    value: 9,
    firstAppearance: "4.16.0",
  }),
  new VersionDetails({
    name: "RenameNoTwistToAllowTwistInTwoBoneIK",
    comment: "rename bNoTwist to bAllowTwist",
    value: 10,
    firstAppearance: "4.17.0",
  }),
  new VersionDetails({
    name: "MaterialLayersParameterSerializationRefactor",
    comment: "Material layers serialization refactor",
    value: 11,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "AddSkeletalMeshSectionDisable",
    comment: "Added disable flag to skeletal mesh data",
    value: 12,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "RemovedMaterialSharedInputCollection",
    comment: "Removed objects that were serialized as part of this material feature",
    value: 13,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "HISMCClusterTreeMigration",
    comment: "HISMC Cluster Tree migration to add new data",
    value: 14,
    firstAppearance: "4.20.0",
  }),
  new VersionDetails({
    name: "PinDefaultValuesVerified",
    comment: "Default values on pins in blueprints could be saved incoherently",
    value: 15,
    firstAppearance: "4.20.0",
  }),
  new VersionDetails({
    name: "FixBrokenStateMachineReferencesInTransitionGetters",
    comment: "During copy and paste transition getters could end up with broken state machine references",
    value: 16,
    firstAppearance: "4.20.0",
  }),
  new VersionDetails({
    name: "MeshDescriptionNewSerialization",
    comment: "Change to MeshDescription serialization",
    value: 17,
    firstAppearance: "4.20.0",
  }),
  new VersionDetails({
    name: "UnclampRGBColorCurves",
    comment: "Change to not clamp RGB values > 1 on linear color curves",
    value: 18,
    firstAppearance: "4.21.0",
  }),
  new VersionDetails({
    name: "LinkTimeAnimBlueprintRootDiscoveryBugFix",
    comment: "Bugfix for FAnimObjectVersion::LinkTimeAnimBlueprintRootDiscovery.",
    value: 19,
    firstAppearance: "4.21.0",
  }),
  new VersionDetails({
    name: "TrailNodeBlendVariableNameChange",
    comment: "Change trail anim node variable deprecation",
    value: 20,
    firstAppearance: "4.21.0",
  }),
  new VersionDetails({
    name: "PropertiesSerializeRepCondition",
    comment: "Make sure the Blueprint Replicated Property Conditions are actually serialized properly.",
    value: 21,
    firstAppearance: "4.23.0",
  }),
  new VersionDetails({
    name: "FocalDistanceDisablesDOF",
    comment: "DepthOfFieldFocalDistance at 0 now disables DOF instead of DepthOfFieldFstop at 0.",
    value: 22,
    firstAppearance: "4.23.0",
  }),
  new VersionDetails({
    name: "Unused_SoundClass2DReverbSend",
    comment: "Removed versioning, but version entry must still exist to keep assets saved with this version loadable",
    value: 23,
    firstAppearance: "4.23.0",
  }),
  new VersionDetails({
    name: "GroomAssetVersion1",
    comment: "Groom asset version",
    value: 24,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "GroomAssetVersion2",
    value: 25,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "SerializeAnimModifierState",
    comment: "Store applied version of Animation Modifier to use when reverting",
    value: 26,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "GroomAssetVersion3",
    comment: "Groom asset version",
    value: 27,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "DeprecateFilmbackSettings",
    comment: "Upgrade filmback",
    value: 28,
    firstAppearance: "4.24.0",
  }),
  new VersionDetails({
    name: "CustomImplicitCollisionType",
    comment: "custom collision type",
    value: 29,
    firstAppearance: "4.25.0",
  }),
  new VersionDetails({
    name: "FFieldPathOwnerSerialization",
    comment: "FFieldPath will serialize the owner struct reference and only a short path to its property",
    value: 30,
    firstAppearance: "4.25.0",
  }),
  new VersionDetails({
    name: "MeshDescriptionNewFormat",
    comment: "This was inadvertently added in UE5. The proper version for it is in in UE5MainStreamObjectVersion",
    value: 31,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "PinTypeIncludesUObjectWrapperFlag",
    comment: "Pin types include a flag that propagates the 'CPF_UObjectWrapper' flag to generated properties",
    value: 32,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "WeightFMeshToMeshVertData",
    comment: "Added Weight member to FMeshToMeshVertData",
    value: 33,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "AnimationGraphNodeBindingsDisplayedAsPins",
    comment: "Animation graph node bindings displayed as pins",
    value: 34,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "SerializeRigVMOffsetSegmentPaths",
    comment: "Serialized rigvm offset segment paths",
    value: 35,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "AbcVelocitiesSupport",
    comment: "Upgrade AbcGeomCacheImportSettings for velocities",
    value: 36,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "MarginAddedToConvexAndBox",
    comment: "Add margin support to Chaos Convex",
    value: 37,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "StructureDataAddedToConvex",
    comment: "Add structure data to Chaos Convex",
    value: 38,
    firstAppearance: "4.26.0",
  }),
  new VersionDetails({
    name: "AddedFrontRightUpAxesToLiveLinkPreProcessor",
    comment: "Changed axis UI for LiveLink AxisSwitch Pre Processor",
    value: 39,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "FixupCopiedEventSections",
    comment: "Some sequencer event sections that were copy-pasted left broken links to the director BP",
    value: 40,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "RemoteControlSerializeFunctionArgumentsSize",
    comment: "Serialize the number of bytes written when serializing function arguments",
    value: 41,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "AddedSubSequenceEntryWarpCounter",
    comment: "Add loop counters to sequencer's compiled sub-sequence data",
    value: 42,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "LonglatTextureCubeDefaultMaxResolution",
    comment: "Remove default resolution limit of 512 pixels for cubemaps generated from long-lat sources",
    value: 43,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "GeometryCollectionCacheRemovesMassToLocal",
    comment: "bake center of mass into chaos cache",
    value: 44,
    firstAppearance: "5.0.0",
  }),
  new VersionDetails({
    name: "ReleaseObjectVersionFixup",
    comment: "Dummy version to allow us to fix up the fact that ReleaseObjectVersion was changed elsewhere",
    value: 31,
    firstAppearance: "4.26.0",
    lastAppearance: "4.27.2",
  }),
];
