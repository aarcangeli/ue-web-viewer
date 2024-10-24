import type { FName } from "../../../types/Name";
import invariant from "tiny-invariant";
import type { UClass } from "./Class";
import type { AssetReader } from "../../../AssetReader";
import type { TaggedProperty } from "../../../properties/TaggedProperty";
import { readTaggedProperties } from "../../../serialization/properties-serialization";
import type { SerializationStatistics } from "../../../serialization/SerializationStatistics";
import { FGuid } from "../structs/Guid";
import { makeNameFromParts } from "../../../path-utils";
import type { EPackageFlags } from "../../../enums";
import { EObjectFlags } from "../../../serialization/ObjectExport";

/**
 * All characters are allowed except for '.' and ':'.
 */
const ValidObjectName = /^[^.:]+$/;

export type ObjectResolver = (reader: AssetReader) => UObject | null;

export type ObjectConstructionParams = {
  clazz: UClass;
  name: FName;
  flags?: EPackageFlags;
};

export enum ELoadingPhase {
  /// The object is not being loaded.
  None,
  /// The object is currently being loaded.
  Loading,
  /// The object has been fully loaded.
  Full,
  /// There was an error loading the object.
  Error,
}

/**
 * The base class of all UE objects.
 *
 * An object instance represents a single object in the UE4 runtime.
 * - Has a name, which is unique within its outer object.
 * - May have an outer object and inner objects.
 * - Has a class, which is an instance of {@link UClass} that represents the class of the object.
 *
 * We are not going to implement all the complexity of the UObject class, we only need the basic functionality to
 * read the properties of the objects.
 *
 * On the C++ side, the UObject class extends UObjectBaseUtility, which extends UObjectBase.
 * However, UHT only manages UObject (see NoExportTypes.h)
 *
 * Do not use WeakRef to weakly reference UObject instances.
 * Use instead asWeakObject() to create a WeakObject instance.
 */
export class UObject {
  private _outer: UObject | null = null;
  private /*readonly*/ _class: UClass;
  private readonly _flags: EPackageFlags;
  private readonly _name: FName;

  public properties: TaggedProperty[] = [];

  /**
   * Unreal Engine doesn't use a strong reference to the children objects.
   * A children object can be collected if there are no other references to it.
   * The outer object, instead, is a strong reference, so the outer will never be collected.
   *
   * This field is automatically populated together with the outer field.
   */
  private readonly _innerObjects: Array<WeakObject> = [];

  /**
   * Statistics about the serialization of this object.
   * Only set if the object was deserialized from an asset.
   */
  serializationStatistics: SerializationStatistics | null = null;

  /**
   * The loading phase of the object.
   */
  loadingPhase: ELoadingPhase = ELoadingPhase.None;

  objectGuid: FGuid | null = null;

  constructor(params: ObjectConstructionParams) {
    invariant(params.clazz, "Class cannot be null");
    invariant(params.name, "Object name cannot be null");
    invariant(!params.name.isNone, "Name cannot be None");
    invariant(ValidObjectName.test(params.name.text), `Invalid object name: ${params.name.text}`);

    this._class = params.clazz;
    this._name = params.name;
    this._flags = params.flags ?? 0;
  }

  /**
   * Returns the name of the object.
   * The name is immutable and cannot be changed after creation.
   * This is unique within the outer object.
   */
  get name(): FName {
    return this._name;
  }

  /**
   * Returns the class of the object.
   * This field is always set and cannot be changed.
   * The class of Class is itself.
   */
  get class(): UClass {
    invariant(this._class !== LazyClass, "Class not initialized");
    return this._class;
  }

  get nameString(): string {
    return this._name.text;
  }

  get outer(): UObject | null {
    return this._outer;
  }

  get nameParts(): FName[] {
    const parts: FName[] = [];

    parts.push(this.name);

    let it = this.outer;
    while (it !== null) {
      parts.push(it.name);
      it = it.outer;
    }

    return parts.reverse();
  }

  get fullName(): string {
    return makeNameFromParts(this.nameParts);
  }

  /**
   * Returns all the objects that have this object as their outer object.
   * Inner objects are weakly referenced, so they can be collected if there are no other references to them.
   */
  get innerObjects(): ReadonlyArray<UObject> {
    return this._innerObjects.map((ref) => ref.deref()).filter((obj) => obj) as UObject[];
  }

  /**
   * Adds a inner object to this object.
   */
  addInner(inner: UObject) {
    validateAddInner(this, inner);
    this._innerObjects.push(inner.asWeakObject());
    inner._outer = this;
  }

  /**
   * Removes an inner object from this object.
   */
  removeInner(inner: UObject) {
    invariant(inner.outer === this, "Object is not an inner of this object");
    const index = this._innerObjects.findIndex((ref) => ref.deref() === inner);
    invariant(index !== -1);
    this._innerObjects.splice(index, 1);
    inner._outer = null;
  }

  deserialize(reader: AssetReader, resolver: ObjectResolver) {
    invariant(!(this._flags & EObjectFlags.RF_ClassDefaultObject), "Cannot deserialize a default object");

    this.properties = readTaggedProperties(reader, true, resolver);

    // read object guid if present
    const hasObjectGuid = reader.readBoolean();
    this.objectGuid = hasObjectGuid ? FGuid.fromStream(reader) : null;
  }

  deserializeDefaultObject(reader: AssetReader, resolver: ObjectResolver) {
    invariant(this._flags & EObjectFlags.RF_ClassDefaultObject, "Can only deserialize a default object");

    this.properties = readTaggedProperties(reader, true, resolver);
  }

  findInnerByFName(name: FName): UObject | null {
    for (const child of this.innerObjects) {
      if (child.name.equals(name)) {
        return child;
      }
    }
    return null;
  }

  replaceLazyClass(clazz: UClass) {
    invariant(this._class === LazyClass, "Class already initialized");
    this._class = clazz;
  }

  asWeakObject(): WeakObject<this> {
    return new WeakObject(this);
  }
}

/**
 * Hack to allow cyclic dependencies between UClass and UObject.
 * Do not use for anything else.
 * see global-instances.ts
 */
export const LazyClass = {} as UClass;

function validateAddInner(parent: UObject, child: UObject) {
  if (child.outer !== null) {
    throw new Error(`Object ${child.name.text} already has an outer object`);
  }
  if (parent.findInnerByFName(child.name) !== null) {
    throw new Error(`Object with name ${child.name.text} already`);
  }
  if (child === parent) {
    throw new Error("Cannot add an object as a child of itself");
  }
  let it = parent.outer;
  while (it !== null) {
    if (it === child) {
      throw new Error("Cannot add an object as a child of its descendant");
    }
    it = it.outer;
  }
}

/**
 * A weak reference to a UObject.
 */
export class WeakObject<T extends UObject = UObject> {
  private _ref: WeakRef<T>;

  constructor(value: T) {
    this._ref = new WeakRef(value);
  }

  deref(): T | null {
    return (this._ref.deref() as T) ?? null;
  }
}
