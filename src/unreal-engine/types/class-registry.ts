import invariant from "tiny-invariant";

import type { UClass } from "../modules/CoreUObject/objects/Class";
import type { ObjectConstructionParams, UObject } from "../modules/CoreUObject/objects/Object";

import { FName } from "./Name";

export interface ClassInfo {
  packageName: FName;
  className: FName;
  superPackageName?: FName;
  superClassName?: FName;
}

const MY_KEY = Symbol("myKey");

export type ObjectClass = {
  new (params: ObjectConstructionParams): UObject;
  // Inject the full class name into the constructor
  [MY_KEY]?: string;
};

type ObjectClassPrivate = {
  new (params: ObjectConstructionParams): UObject;
  // Inject the full class name into the constructor
  [MY_KEY]?: string;
};

const classRegistry = new Map<string, ObjectClassPrivate>();
const matcher = /^\/Script\/(\w+)\.(\w+)$/;

export function RegisterClass(fullClassName: string) {
  return function (constructor: ObjectClassPrivate) {
    const match = matcher.exec(fullClassName);
    invariant(match, `Invalid class name format: ${fullClassName}. Expected format: /Script/Package.ClassName`);
    classRegistry.set(fullClassName, constructor);
    constructor[MY_KEY] = fullClassName;
  };
}

export function findClassOf(clazz: UClass): ObjectClass | null {
  let currentClass: UClass | null = clazz;

  // Find the TS class with better match for the UObject class hierarchy
  while (currentClass) {
    const constructor = classRegistry.get(currentClass.fullName);
    if (constructor) {
      return constructor;
    }
    currentClass = currentClass.superClazz;
  }

  const constructor = classRegistry.get("/Script/CoreUObject.Object");
  if (constructor) {
    return constructor;
  }

  // Really strange, at least UObject should exist.
  throw new Error(`No constructor found for class: ${clazz.fullName}`);
}

export function instantiateObject(params: ObjectConstructionParams): UObject {
  const constructor = findClassOf(params.clazz);
  if (constructor) {
    return new constructor(params);
  }

  // Really strange, at least UObject should exist.
  throw new Error(`No constructor found for class: ${params.clazz.fullName}`);
}

export function getClassName(objectClass: ObjectClassPrivate) {
  return objectClass[MY_KEY];
}

export function getSuperClass(objectClass: ObjectClassPrivate) {
  const prototype = Object.getPrototypeOf(objectClass) as ObjectClassPrivate;
  return prototype?.[MY_KEY];
}

export function getAllClasses(): ClassInfo[] {
  return Array.from(classRegistry.values()).map((clazz) => {
    const [packageName, className] = getClassName(clazz)!.split(".");
    invariant(packageName && className, `Invalid class name format: ${getClassName(clazz)}`);

    const result: ClassInfo = {
      packageName: FName.fromString(packageName),
      className: FName.fromString(className),
    };

    const parentClass = getSuperClass(clazz);
    if (parentClass) {
      const [superPackageName, superClassName] = parentClass.split(".");
      invariant(superPackageName && superClassName, `Invalid super class format: ${parentClass}`);
      result.superPackageName = FName.fromString(superPackageName);
      result.superClassName = FName.fromString(superClassName);
    }

    return result;
  });
}
