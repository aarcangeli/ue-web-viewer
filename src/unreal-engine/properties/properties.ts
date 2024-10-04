import { FPropertyTag } from "./PropertyTag";
import { FName } from "../structs/Name";
import { UObject } from "../objects/CoreUObject/Object";

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

export type booleanValue = {
  type: "boolean";
  value: boolean;
};

export type NumericValue = {
  type: "numeric";
  value: number;
};

export type NameValue = {
  type: "name";
  value: FName;
};

export type StringValue = {
  type: "string";
  value: string;
};

export type ObjectValue = {
  type: "object";
  object: UObject | null;
};

export type StructValue = {
  type: "struct";
  value: Record<string, unknown>;
};

export type ScriptDelegate = {
  type: "delegate";
  object: UObject | null;
  function: FName;
};

export type ArrayValue = {
  type: "array";
  value: PropertyValue[];
};

export type SerializationError = {
  type: "error";
  message: string;
};

export type PropertyValue =
  | booleanValue
  | NumericValue
  | NameValue
  | StringValue
  | ObjectValue
  | StructValue
  | ScriptDelegate
  | ArrayValue
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
