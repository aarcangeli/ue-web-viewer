import { combinePath, isScriptPackage, tryParseExportTextPath } from "./path-utils";
import { describe, it, expect } from "vitest";

describe("tryParseExportTextPath", () => {
  it("should Parse an export text", () => {
    const result = tryParseExportTextPath("/Script/Engine.Blueprint'/Game/BP_Array.BP_Array'");
    expect(result).toEqual(["/Script/Engine.Blueprint", "/Game/BP_Array.BP_Array"]);
  });

  it("should not parse invalid paths #1", () => {
    const result = tryParseExportTextPath("foo");
    expect(result).toBeUndefined();
  });

  it("should not parse invalid paths #2", () => {
    const result = tryParseExportTextPath("Blueprint'/Game/BP_Array.BP_Array'");
    expect(result).toBeUndefined();
  });

  it("should not parse invalid paths #3", () => {
    const result = tryParseExportTextPath(" /Script/Engine.Blueprint'/Game/BP_Array.BP_Array'");
    expect(result).toBeUndefined();
  });

  it("should not parse invalid paths #4", () => {
    const result = tryParseExportTextPath("/Script/Engine.Blueprint'/Game/BP_Array.BP_Array' ");
    expect(result).toBeUndefined();
  });
});

describe("combinePath", () => {
  describe("basic behavior", () => {
    it("combines two paths", () => {
      expect(combinePath("a", "b")).toBe("a/b");
    });

    it("combines multiple paths", () => {
      expect(combinePath("a", "b", "c")).toBe("a/b/c");
    });

    it("returns the single path when only one argument is provided", () => {
      expect(combinePath("a")).toBe("a");
    });

    it("returns an empty string when no arguments are provided", () => {
      expect(combinePath()).toBe("");
    });
  });

  describe("handling slashes", () => {
    it("removes leading slashes", () => {
      expect(combinePath("/a", "b")).toBe("a/b");
    });

    it("removes trailing slashes", () => {
      expect(combinePath("a/", "b")).toBe("a/b");
    });

    it("handles both leading and trailing slashes", () => {
      expect(combinePath("/Game/", "/Characters/", "Hero/")).toBe("Game/Characters/Hero");
    });

    it("ignores segments that are only slashes", () => {
      expect(combinePath("a", "/", "b")).toBe("a/b");
    });

    it("normalizes multiple consecutive slashes", () => {
      expect(combinePath("a//", "//b", "c///")).toBe("a/b/c");
    });

    it("trims whitespace from path segments", () => {
      expect(combinePath(" a ", " b ")).toBe("a/b");
    });
  });

  describe("handling empty paths", () => {
    it("ignores empty path segments", () => {
      expect(combinePath("a", "")).toBe("a");
    });

    it("returns an empty string when all paths are empty", () => {
      expect(combinePath("", "")).toBe("");
    });
  });

  describe("unsupported paths", () => {
    it("throws if a segment contains '.' or '..'", () => {
      expect(() => combinePath("a", ".", "b")).toThrow();
      expect(() => combinePath("a", "..", "b")).toThrow();
    });

    it("throws if a segment contains backslashes", () => {
      expect(() => combinePath("a\\b", "c")).toThrow();
    });
  });
});

describe("isScriptPackage", () => {
  it("should identify script packages", () => {
    expect(isScriptPackage("/Script/Engine")).toBe(true);
    expect(isScriptPackage("/script/engine")).toBe(true);
    expect(isScriptPackage("/SCRIPT/ENGINE")).toBe(true);
    expect(isScriptPackage("/Game/Meshes/SK_Mannequin")).toBe(false);
  });
});
