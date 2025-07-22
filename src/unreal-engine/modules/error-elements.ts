import type { ObjectConstructionParams } from "./CoreUObject/objects/Object";
import { UObject } from "./CoreUObject/objects/Object";

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

const symbol = Symbol("MissingImportedObject");

type MissingImportedObject2<T> = T & {
  [symbol]: true;
};

/**
 * A garbage object that represents an object that cannot be found.
 * All properties and methods will throw an error if accessed (except for basic properties like `name` and `outer`).
 */
export class MissingImportedObject extends UObject {
  private readonly __type_MissingImportedObject!: MissingImportedObject;

  constructor(params: ObjectConstructionParams) {
    super(params);
  }
}

export function createMissingImportedObject<T extends UObject, V extends ObjectConstructionParams>(
  originalClass: new (params: V) => T,
  params: V,
): T {
  const MissingImportedObjectClass = class MissingImportObject extends originalClass {};
  (MissingImportedObjectClass.prototype as any)[symbol] = true;
  const result = new MissingImportedObjectClass(params) as MissingImportedObject2<T>;

  return new Proxy(result, {
    get(target, prop) {
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

export function isMissingImportedObject(obj: UObject): boolean {
  return symbol in obj;
}
