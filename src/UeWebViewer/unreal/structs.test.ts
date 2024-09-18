import { FGuid } from "./structs";

test("renders learn react link", () => {
  const guid = FGuid.fromString("{11223344-5566-7788-99AA-BBCCDDEEFF00}");
  expect(guid.A).toBe(0x11223344);
  expect(guid.B).toBe(0x55667788);
  expect(guid.C).toBe(0x99aabbcc);
  expect(guid.D).toBe(0xddeeff00);
  expect(guid.toString()).toBe("{11223344-5566-7788-99aa-bbccddeeff00}");
});

test("check all F", () => {
  const guid = FGuid.fromString("{ffffffff-ffff-ffff-ffff-ffffffffffff}");
  expect(guid.A).toBe(0xffffffff);
  expect(guid.B).toBe(0xffffffff);
  expect(guid.C).toBe(0xffffffff);
  expect(guid.D).toBe(0xffffffff);
  expect(guid.toString()).toBe("{ffffffff-ffff-ffff-ffff-ffffffffffff}");
});

test("check all 0", () => {
  const guid = FGuid.fromString("{00000000-0000-0000-0000-000000000000}");
  expect(guid.A).toBe(0);
  expect(guid.B).toBe(0);
  expect(guid.C).toBe(0);
  expect(guid.D).toBe(0);
  expect(guid.toString()).toBe("{00000000-0000-0000-0000-000000000000}");
});
