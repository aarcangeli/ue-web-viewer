import invariant from "tiny-invariant";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "./versioning/ue-versions";

/**
 * Low level API to read binary data from an ArrayBuffer.
 * Only supports reading primitive types (integers, floats, strings, names).
 * For more complex data structures, use the provided methods to read the data (e.g. use FGuid.fromStream)
 */
export class AssetReader {
  private dataView: DataView;
  private offset = 0;
  private _littleEndian = true;

  // UE4 and UE5 file versions, filled during the reading of the summary of the asset.
  protected _fileVersionUE4: EUnrealEngineObjectUE4Version | null = null;
  protected _fileVersionUE5: EUnrealEngineObjectUE5Version | null = null;

  // Pool of names filled during the reading of the asset.
  protected _names: string[] | null = null;

  constructor(private content: ArrayBuffer) {
    this.dataView = new DataView(content);
  }

  tell() {
    return this.offset;
  }

  get fileSize() {
    return this.content.byteLength;
  }

  get remaining() {
    return this.content.byteLength - this.offset;
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
    if (offset < 0 || offset > this.content.byteLength) {
      throw new Error("Invalid offset");
    }
    this.offset = offset;
  }

  readBoolean() {
    return this.readInt32() !== 0;
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
    this.ensureBytes(8);
    const value = this.dataView.getBigInt64(this.offset, this._littleEndian);
    this.offset += 8;
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error("Int64 value is too large to be represented as a number");
    }
    return Number(value);
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

  readName() {
    if (this._names === null) {
      throw new Error("Names are not set yet");
    }
    let index = this.readInt32();
    let number = this.readInt32();
    if (index < 0 || index >= this._names.length) {
      throw new Error(`Invalid name index: ${index}`);
    }
    return this._names[index] + (number == 0 ? "" : `_${number}`);
  }

  private ensureBytes(number: number) {
    if (this.offset + number > this.content.byteLength) {
      throw new Error("End of file");
    }
  }

  swapEndian() {
    this._littleEndian = !this._littleEndian;
  }

  get littleEndian() {
    return this._littleEndian;
  }
}

/**
 * An enhanced version of AssetReader that permits to edit file version and names.
 */
export class FullAssetReader extends AssetReader {
  setNames(value: string[]) {
    this._names = value;
  }

  setVersion(fileVersionUE4: EUnrealEngineObjectUE4Version, fileVersionUE5: EUnrealEngineObjectUE5Version) {
    this._fileVersionUE4 = fileVersionUE4;
    this._fileVersionUE5 = fileVersionUE5;
  }
}
