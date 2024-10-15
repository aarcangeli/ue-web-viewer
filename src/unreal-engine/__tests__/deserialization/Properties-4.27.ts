import { readAsset } from "../test-utils";
import invariant from "tiny-invariant";
import { extendJest, matchSnapshots, validateObject } from "./property-tests-utils";

extendJest();

const version = "ue-4.27";

describe("BP_BasicProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = asset.getByFullName("BP_BasicProperties.Default__BP_BasicProperties_C");
    invariant(object);

    expect(object.properties).toHaveLength(16);
    matchSnapshots(object);
    validateObject(object);
  });
});

describe("BP_ContainerProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_ContainerProperties.uasset`);
    const object = asset.getByFullName("BP_ContainerProperties.Default__BP_ContainerProperties_C");
    invariant(object);

    expect(object.properties).toHaveLength(17);
    matchSnapshots(object);
    validateObject(object);
  });
});

describe("BP_NativeStructProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_NativeStructProperties.uasset`);
    const object = asset.getByFullName("BP_NativeStructProperties.Default__BP_NativeStructProperties_C");
    invariant(object);

    expect(object.properties).toHaveLength(23);
    matchSnapshots(object);
    validateObject(object);
  });
});
