import type { UObject } from "../modules/CoreUObject/objects/Object";
import type { FName } from "../types/Name";
import type { FText } from "../types/Text";

import type { NativeStructs } from "./NativeStructs";
import type { FPropertyTag } from "./PropertyTag";
import type { ObjectPtr } from "../modules/CoreUObject/structs/ObjectPtr";

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

export interface BooleanValue {
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

export interface TextValue {
  type: "text";
  value: FText;
}

export interface ObjectValue {
  type: "object";
  object: ObjectPtr;
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
  value: NativeStructs;
}

export interface ScriptDelegate {
  type: "delegate";
  object: ObjectPtr;
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
  | BooleanValue
  | NumericValue
  | NameValue
  | StringValue
  | TextValue
  | ObjectValue
  | StructValue
  | TaggedStructValue
  | ScriptDelegate
  | ArrayValue
  | SetValue
  | MapValue
  | SerializationError;
