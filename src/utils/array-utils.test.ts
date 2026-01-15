import { describe, expect, test, vi } from "vitest";
import { removeInPlace } from "./array-utils";

describe("removeInPlace", () => {
  describe("Check Result", () => {
    test("remove even numbers", () => {
      const arr = [1, 2, 3, 4, 5, 6];
      // remove even numbers
      removeInPlace(arr, (v) => v % 2 === 0);
      expect(arr).toEqual([1, 3, 5]);
    });

    test("remove nothing", () => {
      const arr = ["a", "b", "c"];
      removeInPlace(arr, () => false);
      expect(arr).toEqual(["a", "b", "c"]);
    });

    test("remove all elements when predicate always matches", () => {
      const arr = [0, 0, 0, "element", null, undefined];
      removeInPlace(arr, () => true);
      expect(arr).toEqual([]);
    });

    test("remove last element", () => {
      const arr = [1, 2, 3, 4, 5];
      removeInPlace(arr, (v) => v === 5);
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    test("remove second-last element", () => {
      const arr = [1, 2, 3, 4, 5];
      removeInPlace(arr, (v) => v === 4);
      expect(arr).toEqual([1, 2, 3, 5]);
    });

    test("remove first element", () => {
      const arr = [1, 2, 3, 4, 5];
      removeInPlace(arr, (v) => v === 1);
      expect(arr).toEqual([2, 3, 4, 5]);
    });

    test("remove single element", () => {
      const arr = [1];
      removeInPlace(arr, (v) => v === 1);
      expect(arr).toEqual([]);
    });

    test("remove undefined elements", () => {
      const arr = [10, undefined, null, 30];
      removeInPlace(arr, (v) => v === undefined);
      expect(arr).toEqual([10, null, 30]);
    });

    test("remove null elements", () => {
      const arr = [10, undefined, null, 30];
      removeInPlace(arr, (v) => v === null);
      expect(arr).toEqual([10, undefined, 30]);
    });
  });

  describe("Behavior verification", () => {
    test("interate in the correct order and arguments", () => {
      const arr = [10, 20, 30];
      expect(arr).toEqual([10, 20, 30]);

      const predicate = vi.fn((v: number) => v === 20);

      // Remove the number 20
      removeInPlace(arr, predicate);

      // Verify result
      expect(arr).toEqual([10, 30]);

      // All three elements should have been checked
      expect(predicate).toHaveBeenCalledTimes(3);

      // Verify all calls to the predicate
      expect(predicate).toHaveBeenNthCalledWith(1, 10, 0, arr);
      expect(predicate).toHaveBeenNthCalledWith(2, 20, 1, arr);
      expect(predicate).toHaveBeenNthCalledWith(3, 30, 2, arr);
    });
  });
});
