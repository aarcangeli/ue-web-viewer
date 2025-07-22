import invariant from "tiny-invariant";

import { RegisterClass } from "../../../types/class-registry";
import { isMissingImportedObject } from "../../error-elements";

import type { ObjectConstructionParams } from "./Object";
import { UObject } from "./Object";

export type ClassConstructionParams = ObjectConstructionParams & { superClazz?: UClass };

@RegisterClass("/Script/CoreUObject.Field")
export class UField extends UObject {}

@RegisterClass("/Script/CoreUObject.Struct")
export class UStruct extends UField {
  public readonly superClazz: UStruct | null = null;

  isChildOf(clazz: UStruct): boolean {
    if (clazz === this) {
      return true;
    }

    let current: UStruct | null = this.superClazz;
    while (current) {
      if (current === clazz) {
        return true;
      }
      current = current.superClazz;
    }

    return false;
  }
}

@RegisterClass("/Script/CoreUObject.Class")
export class UClass extends UStruct {
  readonly superClazz: UClass | null;

  constructor(params: ClassConstructionParams) {
    super(params);
    this.superClazz = params.superClazz ?? null;

    if (isMissingImportedObject(this)) {
      return;
    }

    // Invariants
    if (this.superClazz) {
      invariant((this.superClazz as unknown) instanceof UClass, "Super class must be a UClass instance");
    } else {
      invariant(
        this.fullName === "/Script/CoreUObject.Object",
        `UClass must have a super class unless it is the Object class, but got: ${this.fullName}`,
      );
    }
  }
}
