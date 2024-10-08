// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum FSoundSubmixCustomVersion {
  // region Introduced with UE 5.4.0
  /// Before any version changes were made in the plugin
  BeforeCustomVersionWasAdded = 0,
  /// Migrated deprecated properties OutputVolume, WetLevel, DryLevel
  MigrateModulatedSendProperties = 1,
  /// Convert modulated properties to dB.
  ConvertLinearModulatorsToDb = 2,
  // endregion
}

export const FSoundSubmixCustomVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "BeforeCustomVersionWasAdded",
    comment: "Before any version changes were made in the plugin",
    value: 0,
    firstAppearance: "5.4.0",
  }),
  new VersionDetails({
    name: "MigrateModulatedSendProperties",
    comment: "Migrated deprecated properties OutputVolume, WetLevel, DryLevel ",
    value: 1,
    firstAppearance: "5.4.0",
  }),
  new VersionDetails({
    name: "ConvertLinearModulatorsToDb",
    comment: "Convert modulated properties to dB.",
    value: 2,
    firstAppearance: "5.4.0",
  }),
];
