import type { ObjectConstructionParams } from "./CoreUObject/objects/Object";
import { UObject } from "./CoreUObject/objects/Object";

const forbiddenProperties = new Set(["deserialize", "deserializeDefaultObject", "replaceLazyClass"]);

/**
 * A garbage object that represents an object that cannot be found.
 * All properties and methods will throw an error if accessed (except for basic properties like `name` and `outer`).
 */
export class MissingImportedObject extends UObject {
  private readonly __type_MissingImportedObject!: MissingImportedObject;

  constructor(params: ObjectConstructionParams) {
    super(params);

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (typeof prop === "string" && (forbiddenProperties.has(prop) || !(prop in target))) {
          throw new Error(`Attempted to access property '${prop}' on a MissingImportedObject`);
        }
        return Reflect.get(target, prop, receiver);
      },
      set(_target, prop) {
        throw new Error(`Attempted to set property '${String(prop)}' on a MissingImportedObject`);
      },
    });
  }
}

export function isMissingImportedObject(obj: UObject): obj is MissingImportedObject {
  return obj instanceof MissingImportedObject;
}
