import type { UObject } from "./CoreUObject/objects/Object";
import { type ObjectConstructionParams } from "./CoreUObject/objects/Object";

const allowedProperties = new Set([
  "fullName",
  "name",
  "nameString",
  "class",
  "outer",
  "innerObjects",
  "superClazz",
  "asWeakObject",
]);

const MissingImportedObjectSymbol = Symbol("MissingImportedObject");

type MissingImportedObject<T> = T & {
  [MissingImportedObjectSymbol]: true;
};

export function createMock<T extends UObject, V extends ObjectConstructionParams>(
  originalClass: new (params: V) => T,
  params: V,
): T {
  const MissingImportedObjectClass = class MissingImportObject extends originalClass {};
  (MissingImportedObjectClass.prototype as any)[MissingImportedObjectSymbol] = true;
  const result = new MissingImportedObjectClass(params) as MissingImportedObject<T>;

  return new Proxy(result, {
    get(target, prop) {
      if (prop == "isMockObject") {
        return true;
      }
      if (typeof prop === "string" && !allowedProperties.has(prop)) {
        throw new Error(`Attempted to access property '${prop}' on a MissingImportedObject`);
      }
      return Reflect.get(target, prop, target);
    },
    set(_target, prop) {
      throw new Error(`Attempted to set property '${String(prop)}' on a MissingImportedObject`);
    },
  });
}

export function createMissingImportedObject<T extends UObject, V extends ObjectConstructionParams>(
  originalClass: new (params: V) => T,
  params: V,
): T {
  return createMock(originalClass, params);
}

export function isMissingImportedObject(obj: UObject): obj is MissingImportedObject<UObject> {
  return MissingImportedObjectSymbol in obj;
}
