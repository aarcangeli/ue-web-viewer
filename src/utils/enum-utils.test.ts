import { enumToFlags } from "./enum-utils";

describe("enumToFlags", () => {
  it("should be able to combine multiple flag into one string", () => {
    const ObjectFlagsWithValues: Array<[string, number]> = [
      ["Flag1", 1],
      ["Flag2", 2],
      ["Flag3", 4],
      ["Flag4", 8],
      ["Flag5", 16],
    ];

    const result = enumToFlags(10, ObjectFlagsWithValues);
    expect(result).toBe("Flag2 | Flag4");
  });
});
