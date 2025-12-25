import { FName } from "../types/Name";
import { MakeObjectContext } from "../types/object-context";
import { describe, expect, test } from "vitest";
import { UClass } from "./CoreUObject/objects/Class";
import { UObject } from "./CoreUObject/objects/Object";
import { UPackage } from "./CoreUObject/objects/Package";
import { createMissingImportedObject, isMissingImportedObject } from "./error-elements";

describe("MissingImportedObject", () => {
  test("Missing Object", () => {
    const context = MakeObjectContext();

    const obj = createMissingImportedObject(UObject, {
      outer: context.PACKAGE_CoreUObject,
      name: FName.fromString("TestObject"),
      clazz: context.CLASS_Class,
    });

    // Basic checks
    expect(obj).toBeTruthy();
    expect(isMissingImportedObject(obj)).toBe(true);

    // Allowed for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asAny = obj as any;

    expect(() => asAny.something).toThrow("Attempted to access property 'something' on a MissingImportedObject");
    expect(() => asAny["something"]).toThrow("Attempted to access property 'something' on a MissingImportedObject");
    expect(() => (asAny.a = 2)).toThrow("Attempted to set property 'a' on a MissingImportedObject");

    // UObject properties must be accessible
    expect(obj.fullName).toBe("/Script/CoreUObject.TestObject");
    expect(obj.name.toString()).toBe("TestObject");
    expect(obj.nameString).toBe("TestObject");
    expect(obj.class.nameString).toBe("Class");
    expect(obj.outer).toBe(context.PACKAGE_CoreUObject);
    expect(obj.innerObjects).toHaveLength(0);

    // But some properties are still forbidden
    expect(() => obj.deserialize).toThrow("Attempted to access property 'deserialize' on a MissingImportedObject");

    // Even if it is missing, it must be considered an instance of UClass
    expect(asAny instanceof UObject).toBe(true);
    expect(asAny instanceof UClass).toBe(false);
    expect(asAny instanceof UPackage).toBe(false);
  });

  test("Missing Class", () => {
    const context = MakeObjectContext();

    const obj = createMissingImportedObject(UClass, {
      outer: context.PACKAGE_CoreUObject,
      name: FName.fromString("TestClass"),
      clazz: context.CLASS_Class,
      superClazz: context.CLASS_Class,
    });

    // Basic checks
    expect(obj).toBeTruthy();
    expect(isMissingImportedObject(obj)).toBe(true);

    // UObject properties must be accessible
    expect(obj.fullName).toBe("/Script/CoreUObject.TestClass");
    expect(obj.name.toString()).toBe("TestClass");
    expect(obj.nameString).toBe("TestClass");
    expect(obj.class.nameString).toBe("Class");
    expect(obj.outer).toBe(context.PACKAGE_CoreUObject);
    expect(obj.innerObjects).toHaveLength(0);
    expect(obj.superClazz).toBe(context.CLASS_Class);

    // Even if it is missing, it must be considered an instance of UClass
    const asAny = toAny(obj);
    expect(asAny instanceof UClass).toBe(true);
    expect(asAny instanceof UPackage).toBe(false);
  });
});

function toAny(obj: unknown) {
  // This function is used to bypass TypeScript's type checking for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any;
}
