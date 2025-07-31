import { computeCrc } from "./crc32";
import { hexToArrayBuffer, toHex } from "../../../utils/string-utils";

const tests: Array<[string, number]> = [
  /* 00 */ ["", 0x00000000],
  /* 01 */ ["00", 0xd202ef8d],
  /* 02 */ ["3f", 0x6464c2b0],
  /* 03 */ ["ff", 0xff000000],
  /* 04 */ ["24", 0xee010b5c],
  /* 05 */ ["042f", 0x8e64eaa2],
  /* 06 */ ["cf91", 0x8ab37aac],
  /* 07 */ ["1be0dc", 0x3e29f890],
  /* 08 */ ["2cd10e76", 0x600e691a],
  /* 09 */ ["9d55880810", 0x292f3b78],
  /* 10 */ ["afcbbec393e2f0fd4a2e30bdae50de8a", 0x3bc9c661],
  /* 11 */ ["6a688cffb3bf85a2c7d5a25137bb0f2a", 0x1d005e2f],
  /* 12 */ ["018f1b55991b04ef1e2867a187a93912", 0x63f9b6fa],
  /* 13 */ ["e4df55f28826664f203b3915cc524ea2", 0x181ccbb0],
  /* 14 */ ["d3f39d8bdc6bff18d68081942ca552e78e", 0x28f69d07],
  /* 15 */ ["52a08c54c39d55129c45213ea70a425ee8", 0x1f17a41a],
  /* 16 */ ["2db19e7100cb91e9d89bf2bc9f56b55ca7", 0xf714437f],
  /* 17 */ ["41856ac83946c93883bfbbbcf3aa1f5384", 0x41743a0c],
];

describe("crc32", () => {
  tests.forEach(([hex, expected], i) => {
    test(`crc32[${i}]`, () => {
      const data = hexToArrayBuffer(hex);
      const crc32 = computeCrc(data);
      if (crc32 !== expected) {
        console.error(`crc32 of '${hex}' is ${toHex(crc32)}, expected ${toHex(expected)}`);
        expect(crc32).toBe(expected);
      }
    });
  });
});
