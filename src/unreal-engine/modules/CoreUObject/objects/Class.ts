import type { ObjectConstructionParams } from "./Object";
import { UObject } from "./Object";

export type ClassConstructionParams = ObjectConstructionParams & {
  superClazz?: UClass;
};

export class UField extends UObject {}

export class UStruct extends UField {}

export class UClass extends UStruct {
  public readonly superClazz: UClass | null = null;

  constructor(params: ClassConstructionParams) {
    super(params);
    this.superClazz = params.superClazz ?? null;
  }
}
