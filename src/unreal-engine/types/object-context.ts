import "../modules/all-objects";

import invariant from "tiny-invariant";

import type { EPackageFlags } from "../enums";
import { UClass } from "../modules/CoreUObject/objects/Class";
import type { UObject, WeakObjectRef } from "../modules/CoreUObject/objects/Object";
import { UPackage } from "../modules/CoreUObject/objects/Package";
import { NAME_Class, NAME_CoreUObject, NAME_Object, NAME_Package } from "../modules/names";

import { getAllClasses, instantiateObject } from "./class-registry";
import { FName } from "./Name";
import { ObjectPtr } from "../modules/CoreUObject/structs/ObjectPtr";
import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { removeInPlace } from "../../utils/array-utils";

/**
 * A context is a collection of all loaded objects in the application.
 *
 * Unreal Engine, has usually a single global object context, in this project we
 * want to isolate different contexts for modularity and testing purposes.
 *
 * Some objects are spawned synthetically (eg: classes and packages), other are loaded from assets.
 * Most of the objects are weak references, so they can be garbage collected.
 */
export interface IObjectContext {
  /** Quick access to the CoreUObject package. */
  readonly PACKAGE_CoreUObject: UPackage;

  /** Quick access to the Object class. */
  readonly CLASS_Object: UClass;

  /** Quick access to the "Class" class. */
  readonly CLASS_Class: UClass;

  /** Quick access to the Package class. */
  readonly CLASS_Package: UClass;

  /**
   * Returns all root objects in the context.
   * These are the top-level packages that contain all other objects.
   */
  readonly allPackages: Array<UPackage>;

  /**
   * Finds a package by its name.
   * @param name The name of the package to find.
   * @returns The package if found, or null if not found.
   */
  findPackage(name: FName): UPackage | null;

  /**
   * Creates a new package or returns an existing one.
   * If a package with the given name already exists, it returns that package.
   * @param packageName The name of the package to find or create.
   * @param flags Optional flags to set on the package if it is created.
   * @returns The existing or newly created package.
   */
  findOrCreatePackage(packageName: FName, flags?: EPackageFlags): UPackage;

  /**
   * Removes a package from the context.
   * @param uPackage The package to remove.
   */
  removePackage(uPackage: UPackage): void;

  /**
   * Finds a class by its package and class name.
   * @param packageName The name of the package containing the class.
   * @param className The name of the class to find.
   * @returns The class if found, or null if not found.
   */
  findClass(packageName: FName, className: FName): UClass | null;

  /*
   * Creates a new object of the specified class with the given name.
   */
  newObject(outer: UObject, clazz: ObjectPtr<UClass>, name: FName, flags?: EPackageFlags): UObject;
}

export function MakeObjectContext(): IObjectContext {
  return new ObjectContextImpl();
}

/**
 * Concrete implementation of the IObjectContext interface.
 * Use MakeObjectContext() to create an instance of this class.
 */
class ObjectContextImpl implements IObjectContext {
  readonly PACKAGE_CoreUObject: UPackage;
  readonly CLASS_Object: UClass;
  readonly CLASS_Class: UClass;
  readonly CLASS_Package: UClass;

  /** All objects in the context, as weak references. */
  private readonly packages: Array<WeakObjectRef<UPackage>> = [];

  // Keep the list of classes in the context, so they are not garbage collected.
  // noinspection JSMismatchedCollectionQueryUpdate
  private readonly classes: Array<UClass> = [];

  constructor() {
    this.PACKAGE_CoreUObject = this.createInitialClasses();
    this.CLASS_Object = this.getClass(NAME_CoreUObject, NAME_Object);
    this.CLASS_Class = this.getClass(NAME_CoreUObject, NAME_Class);
    this.CLASS_Package = this.getClass(NAME_CoreUObject, NAME_Package);
    this.loadFromClassRegistry();
  }

  /**
   * Returns all objects in the context.
   */
  get allPackages(): Array<UPackage> {
    return this.packages //
      .map((ref) => ref.deref())
      .filter((obj) => obj) as UPackage[];
  }

  findPackage(name: FName): UPackage | null {
    for (const child of this.allPackages) {
      if (child.name.equals(name)) {
        return child;
      }
    }
    return null;
  }

  findClass(packageName: FName, className: FName): UClass | null {
    const classObject = this.resolveClass(packageName, className);
    return classObject ?? null;
  }

  /**
   * Iterate over the class registry and populate the class hierarchy.
   */
  private loadFromClassRegistry() {
    for (const classItem of getAllClasses()) {
      // Resolve the super class.
      // If specified, it must already be registered in the context.
      let superClazz: UClass | null = null;
      if (classItem.superPackageName && classItem.superClassName) {
        const packageName = classItem.superPackageName;
        const className = classItem.superClassName;
        superClazz = this.resolveClass(packageName, className) ?? null;
        invariant(superClazz, `Could not resolve super class ${className} in package ${packageName}`);
      }

      // Create the class object.
      const existingClass = this.resolveClass(classItem.packageName, classItem.className);
      if (existingClass) {
        if (superClazz) {
          const lhs = existingClass.superClazz?.toString();
          const rhs = superClazz.fullName;
          invariant(
            lhs?.toLowerCase() === rhs?.toLowerCase(),
            `Class ${classItem.className} already exists with a different super class. (expected: ${lhs}, actual: ${rhs})`,
          );
        }
        continue;
      }

      const outerPackage = this.findOrCreatePackage(classItem.packageName);

      this.classes.push(
        new UClass({
          outer: outerPackage,
          clazz: ObjectPtr.fromObject(this.CLASS_Class),
          name: classItem.className,
          superClazz: ObjectPtr.fromObject(superClazz),
        }),
      );
    }
  }

  findOrCreatePackage(packageName: FName, flags?: EPackageFlags): UPackage {
    let packageObject = this.findPackage(packageName);
    if (!packageObject) {
      this.cleanStalePackages();
      packageObject = new UPackage({
        outer: null,
        clazz: ObjectPtr.fromObject(this.CLASS_Package),
        name: packageName,
        flags: flags,
      });
      this.packages.push(packageObject.asWeakObject());
    }
    return packageObject;
  }

  newObject(outer: UObject, clazz: ObjectPtr<UClass>, name: FName, flags?: EPackageFlags): UObject {
    invariant(outer !== null, "Outer cannot be null for non-package objects");
    invariant(
      outer.findInnerByFName(name) === null,
      `Object with name ${name} already exists in outer ${outer.fullName}`,
    );

    return instantiateObject({ outer, clazz, name, flags });
  }

  removePackage(uPackage: UPackage) {
    const index = this.packages.findIndex((ref) => ref.deref() === uPackage);
    if (index !== -1) {
      this.packages.splice(index, 1);
      // Mark all inner objects as detached
      uPackage.markAsDetached();
    }
  }

  private getClass(packageName: FName, className: FName): UClass {
    const classObject = this.resolveClass(packageName, className);
    invariant(classObject, `Class ${className} in package ${packageName} not found`);
    return classObject;
  }

  private resolveClass(packageName: FName, className: FName): UClass | undefined {
    const superPackage = this.findPackage(packageName);
    if (superPackage) {
      const classByName = superPackage.findInnerByFName(className);
      if (classByName) {
        invariant(classByName instanceof UClass, `Expected class ${className} to be an instance of UClass`);
        return classByName;
      }
    }
    return undefined;
  }

  /**
   * Unreal's Reflection systems works recursively (like java and others):
   * For example, given an instance `mesh: UStaticMesh`:
   * - `mesh.GetClass()` returns the `UStaticMesh` class,
   * - `mesh.GetClass().GetClass()` returns the `UClass` class,
   * - `mesh.GetClass().GetClass().GetClass()` returns the same `UClass` instance.
   *
   * Because of this recursion, we need to introduce a "lazy" class to break the cycle.
   * Without this, the readonly fields in `UObject` cannot truly remain readonly,
   * as the system would otherwise recurse indefinitely.
   */
  private createInitialClasses() {
    const createClassPtr = (ownerName: FName, className: string) => {
      const softObjectPath = FSoftObjectPath.fromNameParts([ownerName, FName.fromString(className)]);
      return ObjectPtr.fromSoftObjectPath<UClass>(softObjectPath);
    };

    const createClass = (
      owner: UPackage,
      clazz: ObjectPtr<UClass>,
      name: string,
      superClazz: ObjectPtr<UClass> | undefined,
    ) => {
      const createdClass = new UClass({
        outer: owner,
        clazz: clazz,
        name: FName.fromString(name),
        superClazz: superClazz,
      });
      this.classes.push(createdClass);
      return createdClass;
    };

    // Create class ptr
    const ClassClass = createClassPtr(NAME_CoreUObject, "Class");
    const ClassField = createClassPtr(NAME_CoreUObject, "Field");
    const ClassStruct = createClassPtr(NAME_CoreUObject, "Struct");
    const ClassObject = createClassPtr(NAME_CoreUObject, "Object");
    const ClassPackage = createClassPtr(NAME_CoreUObject, "Package");

    // The "class" field forms a circular reference, so we use a special "lazy" class to break this cycle.
    // The actual class reference will be assigned immediately afterward.
    const PACKAGE_CoreUObject = new UPackage({
      outer: null,
      clazz: ClassPackage,
      name: NAME_CoreUObject,
    });
    this.packages.push(PACKAGE_CoreUObject.asWeakObject());

    ClassObject.replaceObject(createClass(PACKAGE_CoreUObject, ClassClass, "Object", undefined));
    ClassField.replaceObject(createClass(PACKAGE_CoreUObject, ClassClass, "Field", ClassObject));
    ClassStruct.replaceObject(createClass(PACKAGE_CoreUObject, ClassClass, "Struct", ClassField));
    ClassPackage.replaceObject(createClass(PACKAGE_CoreUObject, ClassClass, "Package", ClassObject));
    ClassClass.replaceObject(createClass(PACKAGE_CoreUObject, ClassClass, "Class", ClassStruct));

    return PACKAGE_CoreUObject;
  }

  private cleanStalePackages() {
    removeInPlace(this.packages, (ref) => ref.deref() === undefined);
  }
}
