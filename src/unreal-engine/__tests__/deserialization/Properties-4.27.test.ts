import { readAsset, withGlobalEnv } from "../test-utils";
import { extendJest, matchSnapshotProperties } from "./property-tests-utils";
import { describe, expect, test } from "vitest";
import { USkeleton } from "../../modules/Engine/objects/Skeleton";
import { FSoftObjectPath } from "../../modules/CoreUObject/structs/SoftObjectPath";
import invariant from "tiny-invariant";

extendJest();

const version = "ue-4.27";

withGlobalEnv();

describe("BP_BasicProperties", () => {
  test("Properties", async () => {
    const asset = readAsset(`${version}/Content/BP_BasicProperties.uasset`);
    const object = await asset.resolveObject(
      FSoftObjectPath.fromPathString("/Game/BP_BasicProperties.Default__BP_BasicProperties_C"),
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
      FSoftObjectPath.fromPathString("/Game/BP_ContainerProperties.Default__BP_ContainerProperties_C"),
      new AbortController().signal,
    );
    expect(object).toBeDefined();
    matchSnapshotProperties(object!);
  });
});

describe("SK_MeshY_Skeleton", () => {
  test("Properties", async () => {
    const asset = readAsset(`${version}/Content/SK_MeshY_Skeleton.uasset`);
    const object = await asset.resolveObject(
      FSoftObjectPath.fromPathString("/Game/SK_MeshY_Skeleton.SK_MeshY_Skeleton"),
      new AbortController().signal,
    );
    expect(object).toBeDefined();
    expect(object).toBeInstanceOf(USkeleton);
    invariant(object instanceof USkeleton);
    matchSnapshotProperties(object);
    expect(object.SmartNames).toMatchSnapshot("SmartNames");
    expect(object.ReferenceSkeleton).toMatchSnapshot("ReferenceSkeleton");
    expect(object.AnimRetargetSources).toMatchSnapshot("AnimRetargetSources");
    expect(object.Guid).toMatchSnapshot("Guid");
    expect(object.ExistingMarkerNames).toMatchSnapshot("ExistingMarkerNames");
  });
});
