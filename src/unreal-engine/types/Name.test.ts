// Test for Name
import { FName, FNameMap } from "./Name";

describe("Name", () => {
  it("should parse a name #1", () => {
    const name = FName.fromString("MyName");
    expect(name.name).toBe("MyName");
    expect(name.number).toBe(0);
    expect(name.toString()).toBe("MyName");
    expect(name.toJSON()).toBe("MyName");
  });

  it("should parse a name #2", () => {
    const name = FName.fromString("MyName_0");
    expect(name.name).toBe("MyName");
    expect(name.number).toBe(1);
    expect(name.toString()).toBe("MyName_0");
  });

  it("should parse a name #3", () => {
    const name = FName.fromString("MyName_123");
    expect(name.name).toBe("MyName");
    expect(name.number).toBe(124);
    expect(name.toString()).toBe("MyName_123");
  });

  it("should parse a name #4", () => {
    const name = FName.fromString("MyName_123_456");
    expect(name.name).toBe("MyName_123");
    expect(name.number).toBe(457);
    expect(name.toString()).toBe("MyName_123_456");
  });

  it("should parse a name #5", () => {
    const name = FName.fromString("MyName_");
    expect(name.name).toBe("MyName_");
    expect(name.number).toBe(0);
    expect(name.toString()).toBe("MyName_");
  });

  it("should parse a name #6", () => {
    const name = FName.fromString("MyName_01");
    expect(name.name).toBe("MyName_01");
    expect(name.number).toBe(0);
    expect(name.toString()).toBe("MyName_01");
  });

  it("should be case insensitive", () => {
    const name = FName.fromString("MyName");
    expect(name.equals(FName.fromString("myname"))).toBe(true);
  });

  it("check none", () => {
    expect(FName.fromString("none").isNone).toBe(true);
    expect(FName.fromString("None").isNone).toBe(true);
    expect(FName.fromString("None_0").isNone).toBe(false);
    expect(FName.fromString("Value").isNone).toBe(false);
  });
});

describe("FNameMap", () => {
  it("should create a map and add names", () => {
    const map = new FNameMap();
    map.set(FName.fromString("MyName"), "Value1");
    map.set(FName.fromString("MyName_0"), "Value2");
    map.set(FName.fromString("MyName_1"), "Value3");
    expect(map.size).toBe(3);

    // Add the same name again
    map.set(FName.fromString("MyName"), "Value4");
    expect(map.get(FName.fromString("mynAmE"))).toBe("Value4");
    expect(map.size).toBe(3);
  });

  it("should get values by name", () => {
    const map = new FNameMap();
    map.set(FName.fromString("MyName"), "Value1");
    expect(map.get(FName.fromString("MyName"))).toBe("Value1");
    expect(map.get(FName.fromString("myname"))).toBe("Value1");
    expect(map.get(FName.fromString("MyName_0"))).toBeUndefined();
  });
});
