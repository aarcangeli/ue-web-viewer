import { readAsset } from "../test-utils";

import { extendJest, matchSnapshots } from "./property-tests-utils";

extendJest();

const version = "ue-4.27";

describe("BP_BasicProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = asset.getByFullName("BP_BasicProperties.Default__BP_BasicProperties_C");
    matchSnapshots(object);
  });
});

describe("BP_ContainerProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_ContainerProperties.uasset`);
    const object = asset.getByFullName("BP_ContainerProperties.Default__BP_ContainerProperties_C");
    matchSnapshots(object);
  });
});
