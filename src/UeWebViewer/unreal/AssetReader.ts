export class AssetReader {
  private dataView: DataView;
  private offset = 0;
  private littleEndian = true;

  constructor(private content: ArrayBuffer) {
    this.dataView = new DataView(content);
  }

  tell() {
    return this.offset;
  }

  getFileSize() {
    return this.content.byteLength;
  }

  seek(offset: number) {
    if (offset < 0 || offset > this.content.byteLength) {
      throw new Error("Invalid offset");
    }
    this.offset = offset;
  }

  getRemaining() {
    return this.content.byteLength - this.offset;
  }

  readInt8() {
    this.ensureBytes(1);
    return this.dataView.getInt8(this.offset++);
  }

  readInt16() {
    this.ensureBytes(2);
    const value = this.dataView.getInt16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  readInt32() {
    this.ensureBytes(4);
    const value = this.dataView.getInt32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  readInt64(): number {
    this.ensureBytes(8);
    const value = this.dataView.getBigInt64(this.offset, this.littleEndian);
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
    const value = this.dataView.getUint16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  readUInt32() {
    this.ensureBytes(4);
    const value = this.dataView.getUint32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  readUInt64(): number {
    this.ensureBytes(8);
    const value = this.dataView.getBigUint64(this.offset, this.littleEndian);
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

  private ensureBytes(number: number) {
    if (this.offset + number > this.content.byteLength) {
      throw new Error("End of file");
    }
  }

  swapEndian() {
    this.littleEndian = !this.littleEndian;
  }
}
