import { readAsset } from "../utils";
import invariant from "tiny-invariant";
import { UObject } from "../../modules/CoreUObject/objects/Object";

// UObject references should be serialized using their full name
expect.addSnapshotSerializer({
  test: (val) => val instanceof UObject,
  serialize: (obj: UObject) => {
    return "[ref] " + obj.fullName;
  },
});

describe("BP_NativeProperties", () => {
  test("Properties", () => {
    const asset = readAsset("ue-5.4.4/Content/BP_NativeProperties.uasset");
    const object = asset.getByFullName(
      "BP_NativeProperties.Default__BP_NativeProperties_C",
    );
    invariant(object);

    expect(object.properties).toHaveLength(59);
    for (const property of object.properties) {
      expect(property).toMatchSnapshot();
    }
  });
});

describe("BP_StructProperties", () => {
  test("Properties", () => {
    const asset = readAsset("ue-5.4.4/Content/BP_StructProperties.uasset");
    const object = asset.getByFullName(
      "BP_StructProperties.Default__BP_StructProperties_C",
    );
    invariant(object);

    expect(object.properties).toHaveLength(1);
    for (const property of object.properties) {
      expect(property).toMatchSnapshot();
    }
  });
});
