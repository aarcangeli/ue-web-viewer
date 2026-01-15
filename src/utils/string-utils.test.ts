import { expect, test } from "vitest";
import { removeExtension, removePrefix, startsWithCaseInsensitive, toU32Hex } from "./string-utils";

test("removePrefix", () => {
  expect(removePrefix("unreal_engine", "unreal_")).toBe("engine");
  expect(removePrefix("Unreal_Engine", "unreal_", true)).toBe("Engine");
  expect(removePrefix("unreal_engine", "Unreal_", true)).toBe("engine");
  expect(removePrefix("unreal_engine", "engine")).toBe("unreal_engine");
  expect(removePrefix("testString", "test")).toBe("String");
  expect(removePrefix("testString", "Test", true)).toBe("String");
  expect(removePrefix("testString", "string")).toBe("testString");
});

test("removeExtension", () => {
  expect(removeExtension("file.txt")).toBe("file");
  expect(removeExtension("archive.tar.gz")).toBe("archive.tar");
  expect(removeExtension("no_extension")).toBe("no_extension");
  expect(removeExtension(".hiddenfile")).toBe("");
  expect(removeExtension("multiple.dots.in.name.ext")).toBe("multiple.dots.in.name");
  expect(removeExtension("")).toBe("");
});

test("startsWithCaseInsensitive", () => {
  expect(startsWithCaseInsensitive("HelloWorld", "hello")).toBe(true);
  expect(startsWithCaseInsensitive("HelloWorld", "WORLD")).toBe(false);
  expect(startsWithCaseInsensitive("JavaScript", "java")).toBe(true);
  expect(startsWithCaseInsensitive("TypeScript", "script")).toBe(false);
  expect(startsWithCaseInsensitive("CaseInsensitive", "CASE")).toBe(true);
});

test("toU32Hex", () => {
  expect(toU32Hex(255)).toBe("0x000000FF");
  expect(toU32Hex(0)).toBe("0x00000000");
  expect(toU32Hex(16)).toBe("0x00000010");
  expect(toU32Hex(305419896)).toBe("0x12345678");
  expect(toU32Hex(-1)).toBe("0xFFFFFFFF");
});
