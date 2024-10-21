import { FSoftObjectPath } from "./SoftObjectPath";

function exceptEmpty(softObjectPath: FSoftObjectPath) {
  expect(softObjectPath.packageName.text).toBe("None");
  expect(softObjectPath.assetName.text).toBe("None");
  expect(softObjectPath.subPathString).toBe("");
  expect(softObjectPath.isNull()).toBe(true);
  expect(softObjectPath.toString()).toBe("");
}

describe("FSoftObjectPath", () => {
  it("should parse an empty path", () => {
    exceptEmpty(FSoftObjectPath.fromPathString(""));
    exceptEmpty(FSoftObjectPath.fromPathString("None"));
    exceptEmpty(FSoftObjectPath.fromPathString("none"));
  });

  it("should parse a package name", () => {
    const softObjectPath = FSoftObjectPath.fromPathString("/Game/BP_Array");
    expect(softObjectPath.packageName.text).toBe("/Game/BP_Array");
    expect(softObjectPath.assetName.isNone).toBe(true);
    expect(softObjectPath.subPathString).toBe("");
    expect(softObjectPath.isNull()).toBe(false);
    expect(softObjectPath.toString()).toBe("/Game/BP_Array");
  });

  it("should parse an object path", () => {
    const softObjectPath = FSoftObjectPath.fromPathString(
      "/Game/BP_Array.BP_Array",
    );
    expect(softObjectPath.packageName.text).toBe("/Game/BP_Array");
    expect(softObjectPath.assetName.text).toBe("BP_Array");
    expect(softObjectPath.subPathString).toBe("");
    expect(softObjectPath.isNull()).toBe(false);
    expect(softObjectPath.toString()).toBe("/Game/BP_Array.BP_Array");
  });

  it("should parse a full path", () => {
    const softObjectPath = FSoftObjectPath.fromPathString(
      "/Game/BP_Array.BP_Array:SubPath.SubPath",
    );
    expect(softObjectPath.packageName.text).toBe("/Game/BP_Array");
    expect(softObjectPath.assetName.text).toBe("BP_Array");
    expect(softObjectPath.subPathString).toBe("SubPath.SubPath");
    expect(softObjectPath.isNull()).toBe(false);
    expect(softObjectPath.toString()).toBe(
      "/Game/BP_Array.BP_Array:SubPath.SubPath",
    );
  });
});
