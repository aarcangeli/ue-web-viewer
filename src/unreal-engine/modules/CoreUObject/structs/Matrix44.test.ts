import { FMatrix44 } from "./Matrix44";
import { describe, expect, it } from "vitest";

describe("Matrix44", () => {
  it("should be able to create an identity matrix", () => {
    // prettier-ignore
    const matrix = new FMatrix44([
      0, 1, 2, 3,
      4, 5, 6, 7,
      8, 9, 10, 11,
      12, 13, 14, 15
    ]);
    expect(matrix.get(0, 0)).toBe(0);
    expect(matrix.get(0, 1)).toBe(1);
    expect(matrix.get(0, 2)).toBe(2);
    expect(matrix.get(0, 3)).toBe(3);
    expect(matrix.get(1, 0)).toBe(4);
    expect(matrix.get(1, 1)).toBe(5);
    expect(matrix.get(1, 2)).toBe(6);
    expect(matrix.get(1, 3)).toBe(7);
    expect(matrix.get(2, 0)).toBe(8);
    expect(matrix.get(2, 1)).toBe(9);
    expect(matrix.get(2, 2)).toBe(10);
    expect(matrix.get(2, 3)).toBe(11);
    expect(matrix.get(3, 0)).toBe(12);
    expect(matrix.get(3, 1)).toBe(13);
    expect(matrix.get(3, 2)).toBe(14);
    expect(matrix.get(3, 3)).toBe(15);
  });
});
