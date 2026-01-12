import { readAsset } from "../test-utils";
import { extendJest, matchSnapshotProperties } from "./property-tests-utils";
import { describe, expect, test } from "vitest";
import { USkeleton } from "../../modules/Engine/objects/Skeleton";

extendJest();

const version = "ue-4.27";

describe("BP_BasicProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = asset.getObjectByFullName("BP_BasicProperties.Default__BP_BasicProperties_C");
    matchSnapshotProperties(object.getCached()!);
  });
});

describe("BP_ContainerProperties", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/BP_ContainerProperties.uasset`);
    const object = asset.getObjectByFullName("BP_ContainerProperties.Default__BP_ContainerProperties_C");
    matchSnapshotProperties(object.getCached()!);
  });
});

describe("SK_MeshY_Skeleton", () => {
  test("Properties", () => {
    const asset = readAsset(`${version}/Content/SK_MeshY_Skeleton.uasset`);
    const object = asset.getObjectByFullName("SK_MeshY_Skeleton.SK_MeshY_Skeleton");
    expect(object).toBeDefined();
    expect(object.isNull()).toBe(false);
    const skeleton = object.getCached() as USkeleton;
    expect(skeleton).toBeInstanceOf(USkeleton);
    matchSnapshotProperties(skeleton);
    expect(skeleton.SmartNames).toMatchSnapshot("SmartNames");
    expect(skeleton.ReferenceSkeleton).toMatchSnapshot("ReferenceSkeleton");
    expect(skeleton.AnimRetargetSources).toMatchSnapshot("AnimRetargetSources");
    expect(skeleton.Guid).toMatchSnapshot("Guid");
    expect(skeleton.ExistingMarkerNames).toMatchSnapshot("ExistingMarkerNames");
  });
});
