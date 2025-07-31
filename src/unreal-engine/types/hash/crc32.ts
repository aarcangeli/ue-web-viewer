// CRCTables: [8][256]
const CRCTables = generateCrcTable();

export function computeCrc(data: Uint8Array) {
  let crc = ~0;

  // Compute the crc 8 bytes per page
  const numQWords = Math.floor(data.length / 8);
  const dataView = new DataView(data.buffer, data.byteOffset, numQWords * 8);
  for (let i = 0; i < numQWords; i++) {
    const v1 = dataView.getUint32(i * 8, true) ^ crc;
    const v2 = dataView.getUint32(i * 8 + 4, true);
    crc =
      CRCTables[7][v1 & 0xff] ^
      CRCTables[6][(v1 >> 8) & 0xff] ^
      CRCTables[5][(v1 >> 16) & 0xff] ^
      CRCTables[4][(v1 >> 24) & 0xff] ^
      CRCTables[3][v2 & 0xff] ^
      CRCTables[2][(v2 >> 8) & 0xff] ^
      CRCTables[1][(v2 >> 16) & 0xff] ^
      CRCTables[0][(v2 >> 24) & 0xff];
  }

  // Process the remaining bytes
  for (let i = numQWords * 8; i < data.length; i++) {
    const v = data[i];
    crc = (crc >>> 8) ^ CRCTables[0][v ^ (crc & 0xff)];
  }

  crc = ~crc;

  // Ensure we return a 32-bit unsigned integer
  return crc >>> 0;
}

function generateCrcTable(): ReadonlyArray<ReadonlyArray<number>> {
  const reverseBits = (n: number) => {
    let result = 0;
    for (let i = 0; i < 32; i++) {
      result <<= 1;
      result |= n & 1;
      n >>>= 1;
    }
    return result >>> 0;
  };

  const reversedPoly = reverseBits(0x04c11db7);

  const table: number[][] = Array.from({ length: 8 }, () => new Array(256).fill(0));

  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 8; j; j--) {
      crc = crc & 1 ? (crc >>> 1) ^ reversedPoly : crc >>> 1;
    }
    table[0][i] = crc >>> 0;
  }

  for (let i = 0; i < 256; i++) {
    let crc = table[0][i];
    for (let j = 1; j < 8; j++) {
      crc = table[0][crc & 0xff] ^ (crc >>> 8);
      table[j][i] = crc >>> 0;
    }
  }

  return table;
}
