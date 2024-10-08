// This file is generated by `extract_custom_versions.py`.
// Do not edit manually.
// noinspection JSUnusedGlobalSymbols
//

import { VersionDetails } from "../registry";

export enum EVisualLoggerVersion {
  // region Introduced with UE 4.27.0
  Initial = 0,
  HistogramGraphsSerialization = 1,
  AddedOwnerClassName = 2,
  StatusCategoryWithChildren = 3,
  TransformationForShapes = 4,
  // endregion

  // region Introduced with UE 5.0.0
  LargeWorldCoordinatesAndLocationValidityFlag = 5,
  // endregion
}

export const EVisualLoggerVersionDetails: VersionDetails[] = [
  new VersionDetails({
    name: "Initial",
    value: 0,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "HistogramGraphsSerialization",
    value: 1,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "AddedOwnerClassName",
    value: 2,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "StatusCategoryWithChildren",
    value: 3,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "TransformationForShapes",
    value: 4,
    firstAppearance: "4.27.0",
  }),
  new VersionDetails({
    name: "LargeWorldCoordinatesAndLocationValidityFlag",
    value: 5,
    firstAppearance: "5.0.0",
  }),
];
