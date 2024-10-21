// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FExternalPhysicsMaterialCustomObjectVersion {
  // region Introduced with UE 4.25.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  /// Added material masks to Chaos
  AddedMaterialMasks = 1,
  // endregion
}

export const FExternalPhysicsMaterialCustomObjectVersionDetails: VersionDetails[] =
  [
    new VersionDetails({
      name: "BeforeCustomVersionWasAdded",
      comment: "Before any version changes were made",
      value: 0,
      firstAppearance: "4.25.0",
    }),
    new VersionDetails({
      name: "AddedMaterialMasks",
      comment: "Added material masks to Chaos",
      value: 1,
      firstAppearance: "4.25.0",
    }),
  ];
