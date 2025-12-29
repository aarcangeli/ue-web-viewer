import { readAsset } from "../test-utils";
import { extendJest, matchSnapshotProperties } from "./property-tests-utils";
import { describe, expect, test } from "vitest";
import { USkeleton } from "../../modules/Engine/objects/Skeleton";

extendJest();

const version = "ue-4.27";

describe("BP_BasicProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = asset.getByFullName("BP_BasicProperties.Default__BP_BasicProperties_C");
    matchSnapshotProperties(object);
  });
});

describe("BP_ContainerProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_ContainerProperties.uasset`);
    const object = asset.getByFullName("BP_ContainerProperties.Default__BP_ContainerProperties_C");
    matchSnapshotProperties(object);
  });
});

describe("SK_MeshY_Skeleton", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/SK_MeshY_Skeleton.uasset`);
    const object = asset.mainObject as USkeleton;
    expect(object).toBeDefined();
    expect(object).toBeInstanceOf(USkeleton);
    matchSnapshotProperties(object);
    expect(object.SmartNames).toMatchSnapshot("SmartNames");
    expect(object.ReferenceSkeleton).toMatchSnapshot("ReferenceSkeleton");
    expect(object.AnimRetargetSources).toMatchSnapshot("AnimRetargetSources");
    expect(object.Guid).toMatchSnapshot("Guid");
    expect(object.ExistingMarkerNames).toMatchSnapshot("ExistingMarkerNames");
  });
});
