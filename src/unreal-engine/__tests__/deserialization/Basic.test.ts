import type { AssetApi } from "../../serialization/Asset";
import { readAsset, withGlobalEnv } from "../test-utils";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

withGlobalEnv();

// Try to load an asset saved with UE4.0.2
describe("TestActorUE4-0-2", () => {
  let asset: AssetApi;

  // Load asset file once
  beforeAll(() => {
    asset = readAsset("TestActorUE4-0-2.uasset");
  });
  afterAll(() => {
    asset.close();
  });

  test("Read MyBasicActor", () => {
    expect(asset.summary).toMatchSnapshot("summary");
    expect(asset.imports).toMatchSnapshot("imports");
    expect(asset.exports).toMatchSnapshot("exports");
  });

  test("makeFullName", () => {
    expect(asset.makeFullNameByIndex(0).toString()).toBe("None");
    expect(asset.makeFullNameByIndex(55).toString()).toBe(
      "/Game/TestActorUE4-0-2.TestActorUE4-0-2:CustomFunction.K2Node_CallFunction_7631",
    );
    expect(asset.makeFullNameByIndex(-36).toString()).toBe("/Script/CoreUObject.Object:LinearColor");
  });
});

// Try to load an asset saved with UE4.0.2
describe("TestActorUE5-4-4", () => {
  let asset: AssetApi;

  // Load asset file once
  beforeAll(() => {
    asset = readAsset("TestActorUE5-4-4.uasset");
  });

  test("Read MyBasicActor", () => {
    expect(asset.summary).toMatchSnapshot("summary");
    expect(asset.imports).toMatchSnapshot("imports");
    expect(asset.exports).toMatchSnapshot("exports");
  });

  test("makeFullName", () => {
    expect(asset.makeFullNameByIndex(0).toString()).toBe("None");
    expect(asset.makeFullNameByIndex(14).toString()).toBe(
      "/Game/TestActorUE5-4-4.TestActorUE5-4-4:CustomGraph.K2Node_CallFunction_0",
    );
    expect(asset.makeFullNameByIndex(-21).toString()).toBe("/Script/Engine.KismetSystemLibrary:PrintString");
  });
});
