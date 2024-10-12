import invariant from "tiny-invariant";
import type { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "./versioning/ue-versions";
import { FName } from "./types/Name";

/**
 * Low level API to read binary data from an ArrayBuffer.
 * Only supports reading primitive types (integers, floats, strings, names).
 * For more complex data structures, use the provided methods to read the data (e.g. use FGuid.fromStream)
 */
export class AssetReader {
  private offset = 0;
  private _littleEndian = true;

  // UE4 and UE5 file versions, filled during the reading of the summary of the asset.
  protected _fileVersionUE4: EUnrealEngineObjectUE4Version | null = null;
  protected _fileVersionUE5: EUnrealEngineObjectUE5Version | null = null;

  // Pool of names filled during the reading of the asset.
  protected _names: string[] | null = null;

  constructor(private readonly dataView: DataView) {}

  tell() {
    return this.offset;
  }

  get fileSize() {
    return this.dataView.byteLength;
  }

  get remaining() {
    return this.dataView.byteLength - this.offset;
  }

  get fileVersionUE4(): EUnrealEngineObjectUE4Version {
    invariant(this._fileVersionUE4 !== null, "File version UE4 is not set yet");
    return this._fileVersionUE4;
  }

  get fileVersionUE5(): EUnrealEngineObjectUE5Version {
    invariant(this._fileVersionUE5 !== null, "File version UE5 is not set yet");
    return this._fileVersionUE5;
  }

  seek(offset: number) {
    if (offset < 0 || offset > this.dataView.byteLength) {
      throw new Error("Invalid offset");
    }
    this.offset = offset;
  }

  readBoolean() {
    const number = this.readInt32();
    if (number !== 0 && number !== 1) {
      console.warn(`Invalid boolean value: ${number}`);
    }
    return number !== 0;
  }

  readInt8() {
    this.ensureBytes(1);
    return this.dataView.getInt8(this.offset++);
  }

  readInt16() {
    this.ensureBytes(2);
    const value = this.dataView.getInt16(this.offset, this._littleEndian);
    this.offset += 2;
    return value;
  }

  readInt32() {
    this.ensureBytes(4);
    const value = this.dataView.getInt32(this.offset, this._littleEndian);
    this.offset += 4;
    return value;
  }

  readInt64(): number {
    const value = this.readBigInt64();
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error("Int64 value is too large to be represented as a number");
    }
    return Number(value);
  }

  readBigInt64(): bigint {
    this.ensureBytes(8);
    const value = this.dataView.getBigInt64(this.offset, this._littleEndian);
    this.offset += 8;
    return value;
  }

  readUInt8() {
    this.ensureBytes(1);
    return this.dataView.getUint8(this.offset++);
  }

  readUInt16() {
    this.ensureBytes(2);
    const value = this.dataView.getUint16(this.offset, this._littleEndian);
    this.offset += 2;
    return value;
  }

  readUInt32() {
    this.ensureBytes(4);
    const value = this.dataView.getUint32(this.offset, this._littleEndian);
    this.offset += 4;
    return value;
  }

  readUInt64(): number {
    this.ensureBytes(8);
    const value = this.dataView.getBigUint64(this.offset, this._littleEndian);
    this.offset += 8;
    if (value > Number.MAX_SAFE_INTEGER) {
      throw new Error("UInt64 value is too large to be represented as a number");
    }
    return Number(value);
  }

  readFloat() {
    this.ensureBytes(4);
    const value = this.dataView.getFloat32(this.offset, this._littleEndian);
    this.offset += 4;
    return value;
  }

  readDouble() {
    this.ensureBytes(8);
    const value = this.dataView.getFloat64(this.offset, this._littleEndian);
    this.offset += 8;
    return value;
  }

  readString() {
    const length = this.readInt32();
    if (length === 0) {
      return "";
    }
    if (length < 0) {
      throw new Error("Unicode string serialization is not supported at the moment");
    }
    this.ensureBytes(length);
    let result = "";
    for (let i = 0; i < length - 1; i++) {
      result += String.fromCharCode(this.dataView.getUint8(this.offset + i));
    }
    if (this.dataView.getUint8(this.offset + length - 1) !== 0) {
      throw new Error("String is not null-terminated");
    }
    this.offset += length;
    return result;
  }

  readName(): FName {
    if (this._names === null) {
      throw new Error("Names are not set yet");
    }
    const index = this.readInt32();
    const number = this.readInt32();
    if (index < 0 || index >= this._names.length) {
      throw new Error(`Invalid name index: ${index}`);
    }
    return new FName(this._names[index], number);
  }

  /**
   * Advance the reader by the given number of bytes and return a new reader that reads from the same buffer.
   * @param size
   */
  subReader(size: number) {
    this.ensureBytes(size);
    const subDataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + this.offset, size);
    this.offset += size;
    return this.makeChild(subDataView);
  }

  /**
   * Creates a new reader with the same buffer and state.
   * The changes to the new reader do not affect the original reader.
   */
  clone() {
    return this.makeChild(this.dataView);
  }

  private ensureBytes(number: number) {
    if (this.offset + number > this.dataView.byteLength) {
      throw new Error("End of file");
    }
  }

  swapEndian() {
    this._littleEndian = !this._littleEndian;
  }

  get littleEndian() {
    return this._littleEndian;
  }

  private makeChild(newBlob: DataView) {
    const reader = new AssetReader(newBlob);
    reader._littleEndian = this._littleEndian;
    reader._fileVersionUE4 = this._fileVersionUE4;
    reader._fileVersionUE5 = this._fileVersionUE5;
    reader._names = this._names;
    return reader;
  }
}

/**
 * An enhanced version of AssetReader that permits to edit file version and names.
 */
export class FullAssetReader extends AssetReader {
  constructor(dataView: DataView) {
    super(dataView);
  }

  setNames(value: string[]) {
    this._names = value;
  }

  setVersion(fileVersionUE4: EUnrealEngineObjectUE4Version, fileVersionUE5: EUnrealEngineObjectUE5Version) {
    this._fileVersionUE4 = fileVersionUE4;
    this._fileVersionUE5 = fileVersionUE5;
  }
}
