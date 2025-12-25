import { FEngineVersion } from "./EngineVersion";
import { describe, expect, test } from "vitest";

describe("FEngineVersion", () => {
  test("fromComponents", () => {
    const version = FEngineVersion.fromComponents(4, 13, 1, 3142249, "++UE+Release-4.13");
    expect(version.Major).toBe(4);
    expect(version.Minor).toBe(13);
    expect(version.Patch).toBe(1);
    expect(version.Changelist).toBe(3142249);
    expect(version.Branch).toBe("++UE+Release-4.13");
    expect(version.toString()).toBe("4.13.1-3142249+++UE+Release-4.13");
    expect(version.toJSON()).toBe(version.toString());
  });

  test("fromComponents 2", () => {
    const version = FEngineVersion.fromComponents(4, 0, 2, 2034640, "++depot+UE4-Releases+4.0");
    expect(version.Major).toBe(4);
    expect(version.Minor).toBe(0);
    expect(version.Patch).toBe(2);
    expect(version.Changelist).toBe(2034640);
    expect(version.Branch).toBe("++depot+UE4-Releases+4.0");
    expect(version.toString()).toBe("4.0.2-2034640+++depot+UE4-Releases+4.0");
    expect(version.toJSON()).toBe(version.toString());
  });
});
