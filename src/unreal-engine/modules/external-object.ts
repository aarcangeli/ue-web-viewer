import type { UObject } from "./CoreUObject/objects/Object";
import { type ObjectConstructionParams } from "./CoreUObject/objects/Object";

const ExternalObjectSymbol = Symbol("ExternalObject");

type ExternalObject<T> = T & {
  [ExternalObjectSymbol]: true;
};

/**
 * Creates a subclass proxy of the original class to mark it as an external object.
 * @param originalClass
 * @param params
 */
export function createProxy<T extends UObject, V extends ObjectConstructionParams>(
  originalClass: new (params: V) => T,
  params: V,
): T {
  const ProxyObjectClass = class ExternalObjectProxy extends originalClass {
    // We define no constructor, so it uses the originalClass constructor
  };

  const result = new ProxyObjectClass(params) as ExternalObject<T>;
  result[ExternalObjectSymbol] = true;
  return result;
}

export function createExternalObject<T extends UObject, V extends ObjectConstructionParams>(
  originalClass: new (params: V) => T,
  params: V,
): T {
  return createProxy(originalClass, params);
}

export function isProxyObject(obj: UObject): obj is ExternalObject<UObject> {
  return ExternalObjectSymbol in obj;
}
