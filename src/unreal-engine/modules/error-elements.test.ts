import { FName } from "../types/Name";
import { MakeObjectContext } from "../types/object-context";

import { isMissingImportedObject, MissingImportedObject } from "./error-elements";

describe("MissingImportedObject", () => {
  test("should throw an error when accessing a property", () => {
    const context = MakeObjectContext();

    const obj = new MissingImportedObject({
      outer: context.PACKAGE_CoreUObject,
      name: FName.fromString("TestObject"),
      clazz: context.CLASS_Class,
    });

    // Basic checks
    expect(obj).toBeTruthy();
    expect(obj).toBeInstanceOf(MissingImportedObject);
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
  });
});
