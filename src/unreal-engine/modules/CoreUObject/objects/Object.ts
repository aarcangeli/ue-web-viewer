import invariant from "tiny-invariant";

import type { AssetReader } from "../../../AssetReader";
import type { EPackageFlags } from "../../../enums";
import { makeNameFromParts } from "../../../path-utils";
import type { TaggedProperty } from "../../../properties/TaggedProperty";
import { EObjectFlags } from "../../../serialization/ObjectExport";
import { readTaggedProperties } from "../../../serialization/properties-serialization";
import { type SerializationStatistics } from "../../../serialization/SerializationStatistics";
import { RegisterClass } from "../../../types/class-registry";
import type { FName } from "../../../types/Name";
import { FGuid } from "../structs/Guid";
import type { FSoftObjectPath } from "../structs/SoftObjectPath";

import type { UClass } from "./Class";
import type { AssetApi } from "../../../serialization/Asset";

/**
 * All characters are allowed except for '.' and ':'.
 */
const ValidObjectName = /^[^.:]+$/;

export interface ObjectResolver {
  readObjectPtr: (reader: AssetReader) => UObject | null;
  readSoftObjectPtr: (reader: AssetReader) => FSoftObjectPath;
}

export type ObjectConstructionParams = {
  outer?: UObject | null;
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
 * Base class for all Unreal Engine objects.
 *
 * Each instance represents a single object in the UE runtime:
 * - Can have an outer object {@link outer} (strongly referenced) and may contain inner objects {@link innerObjects} (weakly referenced).
 * - Has a unique name within its outer object {@link name}.
 * - Has a class, represented by a {@link UClass} instance {@link class}.
 * - Some instances are loaded from asset files.
 * - Root objects are always packages (instances of {@link UPackage}).
 *
 * In our implementation we also add some functionalities:
 * - An instance may be mocked (eg: for missing asset, lazy loading, etc.).
 * - An instance may be dynamically swapped to another instance (eg: for hot-reloading external changes).
 *   - Use the method {@link freshObject} to get the most up-to-date instance.
 *
 * We're only implementing the minimal UObject functionality needed to read properties.
 *
 * In C++, UObject inherits from UObjectBaseUtility, which in turn inherits from UObjectBase.
 * However, UHT only handles UObject (see NoExportTypes.h).
 *
 * Do not use vanilla WeakRef to weakly reference UObject instances.
 * Instead, use {@link asWeakObject()} to obtain a WeakObject.
 */
@RegisterClass("/Script/CoreUObject.Object")
export class UObject {
  private _outer: UObject | null = null;
  private /*readonly*/ _class: UClass;
  private readonly _flags: EPackageFlags;
  private readonly _name: FName;

  properties: TaggedProperty[] = [];
  objectGuid: FGuid | null = null;

  /**
   * Unreal Engine doesn't use a strong reference to the children objects.
   * A children object can be collected if there are no other references to it.
   * The outer object, instead, is a strong reference, so the outer will never be collected.
   *
   * This field is automatically populated together with the outer field.
   */
  private readonly _innerObjects: Array<WeakObjectRef> = [];

  /**
   * Statistics about the serialization of this object.
   * Only set if the object was deserialized from an asset.
   */
  serializationStatistics: SerializationStatistics | null = null;

  /**
   * The loading phase of the object.
   */
  loadingPhase: ELoadingPhase = ELoadingPhase.None;

  assetApi: AssetApi | null = null;

  constructor(params: ObjectConstructionParams) {
    // Invariants
    invariant(params.clazz, "Class cannot be null");
    invariant(params.name, "Object name cannot be null");
    invariant(!params.name.isNone, "Name cannot be None");
    invariant(ValidObjectName.test(params.name.text), `Invalid object name: ${params.name.text}`);

    this._class = params.clazz;
    this._name = params.name;
    this._flags = params.flags ?? 0;
    params.outer?.addInner(this);
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
   * The class of UClass is itself.
   */
  get class(): UClass {
    invariant(this._class !== LazyClass, "Class not initialized");
    return this._class;
  }

  get nameString(): string {
    return this._name.text;
  }

  get outer(): UObject | null {
    return this._outer?.freshObject ?? null;
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
    return this._innerObjects.map((ref) => ref.deref()?.freshObject).filter((obj) => obj) as UObject[];
  }

  /**
   * Adds an inner object to this object.
   */
  addInner(inner: UObject) {
    if (inner.outer == this) {
      // Nothing to do
      return;
    }
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
    invariant(
      !(this._flags & EObjectFlags.RF_ClassDefaultObject),
      "Use deserializeDefaultObject() for default objects",
    );

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

  isA(clazz: UClass): boolean {
    return clazz.isChildOf(this._class);
  }

  /**
   * Returns the most up-to-date instance of this object.
   * The instance may be swapped for multiple reasons:
   * - The asset file has changed on disk.
   * - The file was missing, and became available later.
   * - The file was intentionally not loaded at first, and was loaded later.
   *
   * The new instance must have the same outer, name and class as this instance.
   * The JavaScript class may be different, for the following reasons:
   * - For mock objects, it may be replaced with a real object.
   * - Real objects may become mock objects.
   */
  get freshObject(): this {
    // TODO: implement
    return this;
  }

  asWeakObject(): WeakObjectRef<this> {
    return new WeakObjectRef(this);
  }

  /**
   * Returns true if this object is a mock object.
   */
  get isMockObject(): boolean {
    return false;
  }
}

/**
 * Hack to allow cyclic dependencies between UClass and UObject.
 * Do not use for anything else.
 * see object-context.ts
 */
export const LazyClass = {} as UClass;

function validateAddInner(parent: UObject, child: UObject) {
  invariant((child as unknown) instanceof UObject, "Child must be an instance of UObject");
  invariant(child.name);
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
 * Represents a weak reference to a {@link UObject}.
 *
 * Unlike strong references, weak references do not prevent the object from being garbage collected.
 * Use this to hold a non-owning reference to a UObject instance.
 */
export class WeakObjectRef<T extends UObject = UObject> {
  private _ref: WeakRef<T>;

  constructor(value: T) {
    this._ref = new WeakRef(value);
  }

  /**
   * Retrieve the referenced object or null if it has been garbage collected.
   */
  deref(): T | null {
    return this._ref.deref()?.freshObject ?? null;
  }
}
