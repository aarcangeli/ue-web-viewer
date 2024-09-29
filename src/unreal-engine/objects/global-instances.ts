import { FName } from "../structs/Name";
import { UPackage } from "./CoreUObject/Package";
import { UClass } from "./CoreUObject/Class";
import { LazyClass, UObject } from "./CoreUObject/Object";

export const PACKAGE_CoreUObject = new UPackage(LazyClass, FName.fromString("/Script/CoreUObject"));

export const CLASS_Object = new UClass(LazyClass, FName.fromString("Object"), null);
export const CLASS_Class = new UClass(LazyClass, FName.fromString("Class"), CLASS_Object);
export const CLASS_Package = new UClass(CLASS_Class, FName.fromString("Package"), null);

CLASS_Class.replaceLazyClass(CLASS_Object);
CLASS_Object.replaceLazyClass(CLASS_Object);
PACKAGE_CoreUObject.replaceLazyClass(CLASS_Package);

PACKAGE_CoreUObject.addInner(CLASS_Object);
PACKAGE_CoreUObject.addInner(CLASS_Class);
PACKAGE_CoreUObject.addInner(CLASS_Package);

/// A special class which represents an unknown class.
export const UnknownClass = new UClass(CLASS_Class, FName.fromString("[Unknown Class]"), null);
export const UnknownObject = new UObject(UnknownClass, FName.fromString("[Unknown Object]"));

// Exported for debugging purposes
// @ts-ignore
window["CoreUObject"] = PACKAGE_CoreUObject;
