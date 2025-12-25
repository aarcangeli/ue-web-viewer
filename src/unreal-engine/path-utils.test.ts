import { tryParseExportTextPath } from "./path-utils";
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
