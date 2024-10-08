// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FClothConfigNvCustomVersion {
  // region Introduced with UE 4.25.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  /// Deprecate legacy structure and enum that couldn't be redirected
  DeprecateLegacyStructureAndEnum = 1,
  // endregion
}

export const FClothConfigNvCustomVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made",
    value: 0,
    firstAppearance: "4.25.0",
  }),
  new VersionDetails({
    name: "DeprecateLegacyStructureAndEnum",
    comment: "Deprecate legacy structure and enum that couldn't be redirected",
    value: 1,
    firstAppearance: "4.25.0",
  }),
];
