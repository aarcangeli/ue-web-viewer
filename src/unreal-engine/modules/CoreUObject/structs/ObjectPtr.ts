import { type UObject } from "../objects/Object";
import { FSoftObjectPath } from "./SoftObjectPath";
import { checkAborted } from "../../../../utils/async-compute";
import invariant from "tiny-invariant";

/**
 * A smart pointer to a UObject (similar to TObjectPtr in Unreal Engine).
 *
 * This class stores a reference together with his path, so that it can be loaded and hot swapped at runtime.
 *
 * Do not ue "==" to compare ObjectPtr instances, use equals() instead.
 */
export class ObjectPtr<T extends UObject = UObject> {
  private listeners = new Set<(value: T) => void>();
  private strongRef: T | null = null;
  private readonly softObjectPath: FSoftObjectPath;

  private constructor(softObjectPath: FSoftObjectPath = new FSoftObjectPath()) {
    this.softObjectPath = softObjectPath;
  }

  static makeNull<T extends UObject>() {
    return new ObjectPtr<T>();
  }

  static fromSoftObjectPath<T extends UObject = UObject>(softObjectPath: FSoftObjectPath): ObjectPtr<T> {
    return softObjectPath.isNull() ? this.makeNull() : new ObjectPtr<T>(softObjectPath);
  }

  static fromObject<T extends UObject>(obj: T | null): ObjectPtr<T> {
    if (!obj) {
      return this.makeNull();
    }
    const softObjectPath = FSoftObjectPath.fromObject(obj);
    const ptr = this.fromSoftObjectPath<T>(softObjectPath);
    ptr.strongRef = obj;
    return ptr;
  }

  /**
   * Retrieve the current cached object reference, it may be null if the object was never loaded.
   */
  getCached(): T | null {
    if (this.strongRef && !this.strongRef.detached) {
      return this.strongRef;
    }
    return null;
  }

  /**
   * Load the object if it's not already loaded and return the reference.
   */
  async load(abort: AbortSignal): Promise<T | null> {
    const object = this.getCached();
    if (object === null) {
      checkAborted(abort);
      // TODO
      throw new Error("Not implemented");
    }
    return object;
  }

  /**
   * Replace the current object reference with a new one.
   * The new object must match the soft object path and the class of the ObjectPtr.
   */
  replaceObject(newObject: T | null) {
    if (newObject) {
      invariant(!this.isNull(), "Cannot replace object on a null ObjectPtr");
      invariant(
        this.softObjectPath.equals(FSoftObjectPath.fromObject(newObject)),
        "The new object must match the soft object path",
      );
    }

    const oldObject = this.getCached();
    if (oldObject !== newObject) {
      // Update the weak reference
      this.strongRef = newObject;
      // Notify listeners
      for (const listener of this.listeners) {
        listener(newObject as T);
      }
    }
  }

  getSoftObjectPath(): FSoftObjectPath {
    return this.softObjectPath;
  }

  /**
   * Fire the listener when the object reference changes.
   */
  subscribe(l: (value: T) => void): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  equals(other: ObjectPtr<T>): boolean {
    return this.softObjectPath.equals(other.softObjectPath);
  }

  isNull(): boolean {
    return this.softObjectPath.isNull();
  }

  toString(): string {
    return this.softObjectPath.toString();
  }
}
