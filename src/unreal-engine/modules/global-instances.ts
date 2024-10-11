import { FName } from "../structs/Name";
import { UPackage } from "./CoreUObject/objects/Package";
import type { ClassConstructionParams } from "./CoreUObject/objects/Class";
import { UClass } from "./CoreUObject/objects/Class";
import type { ObjectConstructionParams } from "./CoreUObject/objects/Object";
import { LazyClass, UObject } from "./CoreUObject/objects/Object";

/**
 * Utility function to create a new object.
 */
function NewObject<T extends UObject>(
  obj: new (params: ObjectConstructionParams) => T,
  clazz: UClass,
  name: string,
): T {
  return new obj({
    clazz: clazz,
    name: FName.fromString(name),
  });
}

/**
 * Utility function to create a new class.
 */
function NewClass<T extends UClass>(
  obj: new (params: ClassConstructionParams) => T,
  clazz: UClass,
  name: string,
  superClazz: UClass | undefined = undefined,
) {
  return new obj({
    clazz: clazz,
    name: FName.fromString(name),
    superClazz: superClazz,
  });
}

// The "class" field is a circular reference, so we need a special "lazy" class to break the cycle.
// The actual class will be set later.
export const PACKAGE_CoreUObject = NewObject(UPackage, LazyClass, "/Script/CoreUObject");

export const CLASS_Object = NewClass(UClass, LazyClass, "Object");
export const CLASS_Class = NewClass(UClass, LazyClass, "Class", CLASS_Object);
export const CLASS_Package = NewClass(UClass, LazyClass, "Package");

PACKAGE_CoreUObject.replaceLazyClass(CLASS_Package);
CLASS_Object.replaceLazyClass(CLASS_Object);
CLASS_Class.replaceLazyClass(CLASS_Object);
CLASS_Package.replaceLazyClass(CLASS_Class);

PACKAGE_CoreUObject.addInner(CLASS_Object);
PACKAGE_CoreUObject.addInner(CLASS_Class);
PACKAGE_CoreUObject.addInner(CLASS_Package);

/// A special class which represents an unknown class.
export const UnknownClass = NewClass(UClass, CLASS_Class, "[Unknown Class]");
export const UnknownObject = NewObject(UObject, UnknownClass, "[Unknown Object]");
