// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FAutomationObjectVersion {
  // region Introduced with UE 4.19.0
  /// Before any version changes were made
  BeforeCustomVersionWasAdded = 0,
  /// New automated screenshot test defaults for more consistent results
  DefaultToScreenshotCameraCutAndFixedTonemapping = 1,
  // endregion
}

export const FAutomationObjectVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made",
    value: 0,
    firstAppearance: "4.19.0",
  }),
  new VersionDetails({
    name: "DefaultToScreenshotCameraCutAndFixedTonemapping",
    comment:
      "New automated screenshot test defaults for more consistent results",
    value: 1,
    firstAppearance: "4.19.0",
  }),
];
