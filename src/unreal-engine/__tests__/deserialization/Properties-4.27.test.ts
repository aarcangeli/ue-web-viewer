import { readAsset } from "../test-utils";
import { extendJest, matchSnapshotProperties } from "./property-tests-utils";
import { describe, expect, test } from "vitest";
import { USkeleton } from "../../modules/Engine/objects/Skeleton";
import { FSoftObjectPath } from "../../modules/CoreUObject/structs/SoftObjectPath";

extendJest();

const version = "ue-4.27";

describe("BP_BasicProperties", () => {
  test("Properties", async () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = await asset.resolveObject(
      FSoftObjectPath.fromPathString("BP_BasicProperties.Default__BP_BasicProperties_C"),
      new AbortController().signal,
    );
    expect(object).toBeDefined();
    matchSnapshotProperties(object!);
  });
});

describe("BP_ContainerProperties", () => {
  test("Properties", async () => {
    const asset = readAsset(`${version}/Content/BP_ContainerProperties.uasset`);
    const object = await asset.resolveObject(
      FSoftObjectPath.fromPathString("BP_ContainerProperties.Default__BP_ContainerProperties_C"),
      new AbortController().signal,
    );
    expect(object).toBeDefined();
    matchSnapshotProperties(object!);
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
