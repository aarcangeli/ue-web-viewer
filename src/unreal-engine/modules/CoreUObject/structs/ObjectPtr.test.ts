import { describe, expect, test, vi } from "vitest";
import { FName } from "../../../types/Name";
import { ObjectPtr } from "./ObjectPtr";
import { withGlobalEnv } from "../../../__tests__/test-utils";
import { globalContainer } from "../../../global-container";
import invariant from "tiny-invariant";

withGlobalEnv();

function createAbortSignal(): AbortSignal {
  return new AbortController().signal;
}

describe("ObjectPtr", () => {
  describe("subscribe", () => {
    test("Replace an object with the same name", async () => {
      invariant(globalContainer);

      const context = globalContainer.context;

      let testPackage = context.findOrCreatePackage(FName.fromString("/Game/TestPackage"));

      // Create an object
      const objectPtr = ObjectPtr.fromObject(
        context.newObject(testPackage, context.CLASS_Object, FName.fromString("TestObject")),
      );
      expect(objectPtr).toBeTruthy();

      // Subscribe to changes
      const fn = vi.fn();
      objectPtr.subscribe(fn);

      // Remove the package
      context.removePackage(testPackage);
      expect(objectPtr.getCached()).toBeNull();
      expect(fn).toHaveBeenCalledTimes(0); // Removed does not trigger callback (for now)

      // Recreate the same object
      testPackage = context.findOrCreatePackage(FName.fromString("/Game/TestPackage"));
      const newObject = context.newObject(testPackage, context.CLASS_Object, FName.fromString("TestObject"));
      expect(await objectPtr.load(createAbortSignal())).toBe(newObject);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
