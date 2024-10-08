// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FAnimationCustomVersion {
  // region Introduced with UE 4.9.0
  /// Before any version changes were made in the plugin
  BeforeCustomVersionWasAdded = 0,
  /// changed the range to apply to the input, and added a configurable method for updating the components
  BoneDrivenControllerMatchingMaya = 1,
  /// Converted the range clamp into a remap function, rather than just clamping
  BoneDrivenControllerRemapping = 2,
  // endregion

  // region Introduced with UE 4.11.0
  /// Added ability to offset angular ranges for constraints
  AnimDynamicsAddAngularOffsets = 3,
  // endregion

  // region Introduced with UE 4.15.0
  /// Renamed Stretch Limits to better names
  RenamedStretchLimits = 4,
  // endregion

  // region Introduced with UE 4.18.0
  /// Convert IK to support FBoneSocketTarget
  ConvertIKToSupportBoneSocketTarget = 5,
  // endregion
}

export const FAnimationCustomVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made in the plugin",
    value: 0,
    firstAppearance: "4.9.0",
  }),
  new VersionDetails({
    name: "BoneDrivenControllerMatchingMaya",
    comment: "changed the range to apply to the input, and added a configurable method for updating the components",
    value: 1,
    firstAppearance: "4.9.0",
  }),
  new VersionDetails({
    name: "BoneDrivenControllerRemapping",
    comment: "Converted the range clamp into a remap function, rather than just clamping",
    value: 2,
    firstAppearance: "4.9.0",
  }),
  new VersionDetails({
    name: "AnimDynamicsAddAngularOffsets",
    comment: "Added ability to offset angular ranges for constraints",
    value: 3,
    firstAppearance: "4.11.0",
  }),
  new VersionDetails({
    name: "RenamedStretchLimits",
    comment: "Renamed Stretch Limits to better names",
    value: 4,
    firstAppearance: "4.15.0",
  }),
  new VersionDetails({
    name: "ConvertIKToSupportBoneSocketTarget",
    comment: "Convert IK to support FBoneSocketTarget",
    value: 5,
    firstAppearance: "4.18.0",
  }),
];
