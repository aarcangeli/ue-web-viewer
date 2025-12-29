import { describe, expect, it } from "vitest";
import { FTransform } from "./Transform";
import { FVector3 } from "./Vector3";
import { FQuat } from "./Quat";

describe("FTransform", () => {
  it("should build a correct default FTransform", () => {
    const transform = new FTransform();

    expect(transform.Translation).toBeDefined();
    expect(transform.Translation.X).toBe(0);
    expect(transform.Translation.Y).toBe(0);
    expect(transform.Translation.Z).toBe(0);

    expect(transform.Rotation).toBeDefined();
    expect(transform.Rotation.X).toBe(0);
    expect(transform.Rotation.Y).toBe(0);
    expect(transform.Rotation.Z).toBe(0);
    expect(transform.Rotation.W).toBe(1);

    expect(transform.Scale3D).toBeDefined();
    expect(transform.Scale3D.X).toBe(1);
    expect(transform.Scale3D.Y).toBe(1);
    expect(transform.Scale3D.Z).toBe(1);
  });

  // From data
  it("should build a correct FTransform from data", () => {
    const transform = new FTransform(new FVector3(20, 30, 40), new FQuat(1, 2, 3, 4), new FVector3(5, 6, 7));

    expect(transform.Translation.X).toBe(20);
    expect(transform.Translation.Y).toBe(30);
    expect(transform.Translation.Z).toBe(40);

    expect(transform.Rotation.X).toBe(1);
    expect(transform.Rotation.Y).toBe(2);
    expect(transform.Rotation.Z).toBe(3);
    expect(transform.Rotation.W).toBe(4);

    expect(transform.Scale3D.X).toBe(5);
    expect(transform.Scale3D.Y).toBe(6);
    expect(transform.Scale3D.Z).toBe(7);
  });
});
