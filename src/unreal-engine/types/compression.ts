import type { AssetReader } from "../AssetReader";
import invariant from "tiny-invariant";
import { FBlake3Hash } from "./hash/Blake3Hash";
import { decompress } from "../../externals";

const HeaderSize = 64;
const MagicNumber = 0xb7756362;

export class FHeader {
  magic: number = 0;
  crc32: number = 0;
  method: EMethod = EMethod.None;
  compressor: number = 0;
  compressionLevel: number = 0;
  blockSizeExponent: number = 0;
  blockCount: number = 0;
  totalRawSize: number = 0;
  totalCompressedSize: number = 0;
  rawHash: FBlake3Hash = new FBlake3Hash();

  static fromStream(reader: AssetReader): FHeader {
    const headerReader = reader.subReader(HeaderSize);
    headerReader.setLittleEndian(false);
    const header = new FHeader();
    header.magic = headerReader.readUInt32();
    if (header.magic !== MagicNumber) {
      throw new Error(`Invalid magic number: expected ${MagicNumber}, got ${header.magic}`);
    }

    header.crc32 = headerReader.readUInt32();
    header.method = headerReader.readUInt8() as EMethod;
    header.compressor = headerReader.readUInt8();
    header.compressionLevel = headerReader.readUInt8();
    header.blockSizeExponent = headerReader.readUInt8();
    header.blockCount = headerReader.readUInt32();
    header.totalRawSize = headerReader.readInt64();
    header.totalCompressedSize = headerReader.readInt64();
    header.rawHash = FBlake3Hash.fromStream(headerReader);
    invariant(headerReader.getRemaining() === 0, "FHeader must be read from a 64-byte stream");
    return header;
  }
}

export async function uncompressData(reader: AssetReader): Promise<Uint8Array> {
  // TODO: add CRC verification

  // Read the header using a sub-reader
  const header = FHeader.fromStream(reader);

  // If the file is not compressed, read and return the raw bytes
  if (header.method === EMethod.None) {
    return reader.readBytes(header.totalRawSize);
  }

  if (header.method === EMethod.Oodle) {
    return decompressBlockedData(header, reader);
  }

  throw new Error(`Unsupported compression method: ${EMethod[header.method]}`);
}

async function decompressBlockedData(header: FHeader, reader: AssetReader): Promise<Uint8Array> {
  reader.setLittleEndian(false);
  const blockSizes: number[] = [];
  for (let i = 0; i < header.blockCount; i++) {
    blockSizes.push(reader.readUInt32());
  }

  const result = new Uint8Array(header.totalRawSize);
  const uncompressedBlockSize = 1 << header.blockSizeExponent;
  const lastBlockSize = header.totalRawSize - uncompressedBlockSize * (header.blockCount - 1);
  let decompressedOffset = 0;

  for (let i = 0; i < header.blockCount; i++) {
    const blockData = reader.readBytes(blockSizes[i]);
    const blockSize = i === header.blockCount - 1 ? lastBlockSize : uncompressedBlockSize;

    // Apparently, if the size of the compressed block is equal to the uncompressed size, it means no compression was applied.
    // In this case, we can just copy the data directly.
    if (blockData.length === blockSize) {
      result.set(blockData, decompressedOffset);
      decompressedOffset += blockSize;
      continue;
    }

    const decompressed = await decompressData(header.method, blockData, blockSize);
    result.set(decompressed, decompressedOffset);
    decompressedOffset += blockSize;
  }

  return result;
}

/** Method used to compress the data in a compressed buffer. */
export enum EMethod {
  /** Header is followed by one uncompressed block. */
  None = 0,
  /** Header is followed by an array of compressed block sizes then the compressed blocks. */
  Oodle = 3,
  /** Header is followed by an array of compressed block sizes then the compressed blocks. */
  LZ4 = 4,
}

/**
 * Decompresses the data using the specified method.
 * @param method The compression method used to compress the data.
 * @param data The compressed data to decompress.
 * @param outputSize The expected size of the decompressed data.
 */
export async function decompressData(method: EMethod, data: Uint8Array, outputSize: number): Promise<Uint8Array> {
  switch (method) {
    case EMethod.None:
      return data;
    case EMethod.Oodle:
      if (!decompress) {
        throw new Error("This build does not include the Oodle decompressor.");
      }
      return decompress(data, outputSize);
    default:
      throw new Error(`Unsupported compression method: ${EMethod[method]}`);
  }
}

/**
 * Checks if the specified compression method is available in the current build.
 */
export function isDecompressionAvailable(method: EMethod): boolean {
  switch (method) {
    case EMethod.None:
      return true;
    case EMethod.Oodle:
      return Boolean(decompress);
    default:
      return false;
  }
}
