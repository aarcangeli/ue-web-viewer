import { RegisterClass } from "../../../types/class-registry";

import type { ObjectConstructionParams } from "./Object";
import { UObject } from "./Object";
import type { ObjectPtr } from "../structs/ObjectPtr";

export type ClassConstructionParams = ObjectConstructionParams & { superClazz?: ObjectPtr<UClass> };

@RegisterClass("/Script/CoreUObject.Field")
export class UField extends UObject {}

@RegisterClass("/Script/CoreUObject.Struct")
export class UStruct extends UField {
  public readonly superClazz: ObjectPtr<UStruct> | null = null;

  isChildOf(clazz: UStruct): boolean {
    if (clazz === this) {
      return true;
    }

    let current: UStruct | null = this.superClazz?.getCached() || null;
    while (current) {
      if (current === clazz) {
        return true;
      }
      current = current.superClazz?.getCached() || null;
    }

    return false;
  }
}

@RegisterClass("/Script/CoreUObject.Class")
export class UClass extends UStruct {
  readonly superClazz: ObjectPtr<UClass> | null;

  constructor(params: ClassConstructionParams) {
    super(params);
    this.superClazz = params.superClazz ?? null;
  }
}
