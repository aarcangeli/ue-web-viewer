import { UClass } from "../modules/CoreUObject/objects/Class";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import { UStaticMesh } from "../modules/Engine/objects/StaticMesh";
import { NAME_Class, NAME_CoreUObject, NAME_Object, NAME_Package } from "../modules/names";
import { describe, expect, test } from "vitest";
import { FName } from "./Name";
import type { IObjectContext } from "./object-context";
import { MakeObjectContext } from "./object-context";
import { ObjectPtr } from "../modules/CoreUObject/structs/ObjectPtr";

describe("ObjectContext", () => {
  test("initialization", () => {
    const context = MakeObjectContext();

    // Package CoreUObject
    const coreUObject = context.PACKAGE_CoreUObject;
    expect(coreUObject).toBeTruthy();
    expect(coreUObject).toBeInstanceOf(UPackage);
    expect(coreUObject.fullName).toBe("/Script/CoreUObject");
    expect(coreUObject.outer).toBeNull();
    expect(coreUObject.class.toString()).toBe("/Script/CoreUObject.Package");

    // Class
    const classClass = context.CLASS_Class;
    expect(classClass).toBeTruthy();
    expect(classClass).toBeInstanceOf(UClass);
    expect(classClass.fullName).toBe("/Script/CoreUObject.Class");
    expect(classClass.outer).toBe(coreUObject);
    expect(classClass.class.getCached()).toBe(classClass);
    expect(coreUObject.innerObjects).toContain(classClass);

    // Class Object
    const classObject = context.CLASS_Object;
    expect(classObject).toBeTruthy();
    expect(classObject).toBeInstanceOf(UClass);
    expect(classObject.fullName).toBe("/Script/CoreUObject.Object");
    expect(classObject.outer).toBe(coreUObject);
    expect(classObject.class.getCached()).toBe(classClass);
    expect(coreUObject.innerObjects).toContain(classObject);

    // Class Package
    const classPackage = context.CLASS_Package;
    expect(classPackage).toBeTruthy();
    expect(classPackage).toBeInstanceOf(UClass);
    expect(classPackage.fullName).toBe("/Script/CoreUObject.Package");
    expect(classPackage.outer).toBe(coreUObject);
    expect(classPackage.class.getCached()).toBe(classClass);
    expect(coreUObject.innerObjects).toContain(classPackage);
    expect(coreUObject.class.getCached()).toBe(classPackage);

    // Check root objects
    const rootObjects = context.allPackages;
    expect(rootObjects).toBeTruthy();
    expect(rootObjects).toContain(coreUObject);

    // Verify lookup methods
    expect(context.findPackage(NAME_CoreUObject)).toBe(coreUObject);
    expect(context.findClass(NAME_CoreUObject, NAME_Class)).toBe(classClass);
    expect(context.findClass(NAME_CoreUObject, NAME_Object)).toBe(classObject);
    expect(context.findClass(NAME_CoreUObject, NAME_Package)).toBe(classPackage);

    // Verify other packages
    const packageEngine = context.findPackage(FName.fromString("/Script/Engine"))!;
    expect(packageEngine).toBeTruthy();
    expect(packageEngine.fullName).toBe("/Script/Engine");
    expect(packageEngine.outer).toBeNull();
    expect(packageEngine.class.getCached()).toBe(classPackage);

    // Verify other classes
    const classStaticMesh = context.findClass(packageEngine.name, FName.fromString("StaticMesh"))!;
    expect(classStaticMesh).toBeTruthy();
    expect(classStaticMesh.fullName).toBe("/Script/Engine.StaticMesh");
    expect(classStaticMesh.outer).toBe(packageEngine);
    expect(classStaticMesh.class.getCached()).toBe(classClass);
  });

  test("class hierarchy", () => {
    const context = MakeObjectContext();

    const classObject = context.CLASS_Object;
    const classClass = context.CLASS_Class;
    const classPackage = context.CLASS_Package;
    const classStaticMesh = context.findClass(FName.fromString("/Script/Engine"), FName.fromString("StaticMesh"))!;
    expect(classStaticMesh).toBeTruthy();

    // Check isChildOf with all combinations
    expect(classObject.isChildOf(classObject)).toBe(true);
    expect(classObject.isChildOf(classClass)).toBe(false);
    expect(classObject.isChildOf(classPackage)).toBe(false);
    expect(classObject.isChildOf(classStaticMesh)).toBe(false);

    expect(classClass.isChildOf(classObject)).toBe(true);
    expect(classClass.isChildOf(classClass)).toBe(true);
    expect(classClass.isChildOf(classPackage)).toBe(false);
    expect(classClass.isChildOf(classStaticMesh)).toBe(false);

    expect(classPackage.isChildOf(classObject)).toBe(true);
    expect(classPackage.isChildOf(classClass)).toBe(false);
    expect(classPackage.isChildOf(classPackage)).toBe(true);
    expect(classPackage.isChildOf(classStaticMesh)).toBe(false);

    expect(classStaticMesh.isChildOf(classObject)).toBe(true);
    expect(classStaticMesh.isChildOf(classClass)).toBe(false);
    expect(classStaticMesh.isChildOf(classPackage)).toBe(false);
    expect(classStaticMesh.isChildOf(classStaticMesh)).toBe(true);

    // UStaticMesh is a child of StreamableRenderAsset
    const classStreamableRenderAsset = context.findClass(
      FName.fromString("/Script/Engine"),
      FName.fromString("StreamableRenderAsset"),
    )!;
    expect(classStreamableRenderAsset).toBeTruthy();
    expect(classStaticMesh.superClazz?.getCached()).toBe(classStreamableRenderAsset);
    expect(classStaticMesh.isChildOf(classStreamableRenderAsset)).toBe(true);
    expect(classStreamableRenderAsset.isChildOf(classStaticMesh)).toBe(false);
  });

  test("package creation", () => {
    const context = MakeObjectContext();

    const testPackage = context.findOrCreatePackage(FName.fromString("/Script/TestPackage"));
    expect(testPackage).toBeTruthy();
    expect(testPackage.fullName).toBe("/Script/TestPackage");
    expect(testPackage.outer).toBeNull();
    expect(testPackage.class.getCached()).toBe(context.CLASS_Package);

    // The package should be empty initially
    expect(testPackage.innerObjects).toHaveLength(0);

    expect(context.allPackages).toContain(testPackage);
    expect(context.findPackage(FName.fromString("/Script/TestPackage"))).toBe(testPackage);
  });

  test("class creation", () => {
    const context = MakeObjectContext();

    const testClass = createClass(context, "TestClass", context.CLASS_Class);
    expect(testClass).toBeTruthy();
    expect(testClass.fullName).toBe("/Script/CoreUObject.TestClass");
    expect(testClass.outer).toBe(context.PACKAGE_CoreUObject);
    expect(testClass.class.getCached()).toBe(context.CLASS_Class);
    expect(testClass.superClazz?.getCached()).toBe(context.CLASS_Class);
    expect(testClass.innerObjects).toHaveLength(0);

    const childClass = createClass(context, "ChildTestClass", testClass);
    expect(childClass).toBeTruthy();
    expect(childClass.fullName).toBe("/Script/CoreUObject.ChildTestClass");
    expect(childClass.outer).toBe(context.PACKAGE_CoreUObject);
    expect(childClass.class.getCached()).toBe(context.CLASS_Class);
    expect(childClass.superClazz?.getCached()).toBe(testClass);
    expect(childClass.innerObjects).toHaveLength(0);

    expect(context.findClass(NAME_CoreUObject, FName.fromString("TestClass"))).toBe(testClass);
    expect(context.findClass(NAME_CoreUObject, FName.fromString("ChildTestClass"))).toBe(childClass);
  });

  test("object creation", () => {
    const context = MakeObjectContext();

    const classStaticMesh = context.findClass(FName.fromString("/Script/Engine"), FName.fromString("StaticMesh"))!;
    expect(classStaticMesh).toBeTruthy();

    const myMesh = context.newObject(context.PACKAGE_CoreUObject, classStaticMesh, FName.fromString("MyStaticMesh"));
    expect(myMesh).toBeTruthy();
    expect(myMesh).toBeInstanceOf(UStaticMesh);
    expect(myMesh.fullName).toBe("/Script/CoreUObject.MyStaticMesh");
    expect(myMesh.outer).toBe(context.PACKAGE_CoreUObject);
    expect(myMesh.class.getCached()).toBe(classStaticMesh);
    expect(context.PACKAGE_CoreUObject.innerObjects).toContain(myMesh);
  });
});

function createClass(ctx: IObjectContext, className: string, superClazz: UClass) {
  return new UClass({
    outer: ctx.PACKAGE_CoreUObject,
    clazz: ObjectPtr.fromObject(ctx.CLASS_Class),
    name: FName.fromString(className),
    superClazz: ObjectPtr.fromObject(superClazz),
  });
}
