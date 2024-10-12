import type { FPropertyTag } from "./PropertyTag";
import type { FName } from "../structs/Name";
import type { UObject } from "../modules/CoreUObject/objects/Object";

export class TaggedProperty {
  public readonly tag: FPropertyTag;
  public readonly value: PropertyValue;

  constructor(tag: FPropertyTag, value: PropertyValue) {
    this.tag = tag;
    this.value = value;
  }

  get name(): FName {
    return this.tag.name;
  }

  get nameString(): string {
    return this.tag.name.text;
  }

  get arrayIndex(): number {
    return this.tag.arrayIndex;
  }
}

export interface booleanValue {
  type: "boolean";
  value: boolean;
}

export interface NumericValue {
  type: "numeric";
  value: number;
}

export interface NameValue {
  type: "name";
  value: FName;
}

export interface StringValue {
  type: "string";
  value: string;
}

export interface ObjectValue {
  type: "object";
  object: UObject | null;
}

export interface TaggedStructValue {
  type: "struct";
  value: TaggedProperty[];
}

/**
 * A struct with a native serialization format.
 */
export interface StructValue {
  type: "native-struct";
  value: Record<string, any>;
}

export interface ScriptDelegate {
  type: "delegate";
  object: UObject | null;
  function: FName;
}

export interface ArrayValue {
  type: "array";
  value: Array<PropertyValue>;
}

export interface SetValue {
  type: "set";
  elementsToRemove: PropertyValue[];
  value: Array<PropertyValue>;
}

export interface MapValue {
  type: "map";
  elementsToRemove: PropertyValue[];
  value: Array<[PropertyValue, PropertyValue]>;
}

export interface SerializationError {
  type: "error";
  message: string;
}

export type PropertyValue =
  | booleanValue
  | NumericValue
  | NameValue
  | StringValue
  | ObjectValue
  | StructValue
  | TaggedStructValue
  | ScriptDelegate
  | ArrayValue
  | SetValue
  | MapValue
  | SerializationError;

/**
 * Utility function to create an error value.
 */
export function makeError(message: string): SerializationError {
  return {
    type: "error",
    message: message,
  };
}
