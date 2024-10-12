import { FPropertyTypeName } from "./PropertyTag";
import { FGuid } from "../modules/CoreUObject/structs/Guid";
import { FName } from "../types/Name";
import { EPropertyType } from "./enums";

describe("FPropertyTypeName", () => {
  it("Sample", () => {
    let name = new FPropertyTypeName(FName.fromString("TagName"));
    name = name.addParameter(FPropertyTypeName.fromString("arg1"));
    name = name.addParameter(
      FPropertyTypeName.fromString("arg2").addParameter(FPropertyTypeName.fromString("nested-arg")),
    );

    // Full name
    expect(name.toString()).toBe("TagName(arg1,arg2(nested-arg))");

    // Check parameters
    expect(name.getParameter(0).name.text).toBe("arg1");
    expect(name.getParameter(1).name.text).toBe("arg2");
    expect(name.getParameter(1).getParameter(0).name.text).toBe("nested-arg");
  });

  it("ToString()", () => {
    // Build a real property type name
    const name = new FPropertyTypeName(FName.fromString("StructProperty"), [
      new FPropertyTypeName(FName.fromString("BPS_TestStructure"), [
        FPropertyTypeName.fromString("/Game/BPS_TestStructure"),
      ]),
      FPropertyTypeName.fromGuid(FGuid.fromString("{c09f9868-40e3-c215-4f33-f088bdf2d890}")),
    ]);

    expect(name.toString()).toBe(
      "StructProperty(BPS_TestStructure(/Game/BPS_TestStructure),c09f9868-40e3-c215-4f33-f088bdf2d890)",
    );

    // test alias
    expect(name.text).toBe(name.toString());
    expect(name.toJSON()).toBe(name.toString());
    expect(name.propertyType).toBe(EPropertyType.StructProperty);
  });
});
