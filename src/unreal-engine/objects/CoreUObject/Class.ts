import { UObject } from "./Object";
import type { FName } from "../../structs/Name";

export class UField extends UObject {}

export class UStruct extends UField {}

export class UClass extends UStruct {
  public readonly superClazz: UClass | null = null;

  constructor(clazz: UClass, name: FName, superClazz: UClass | null) {
    super(clazz, name);
    this.superClazz = superClazz;
  }
}
