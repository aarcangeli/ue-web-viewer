import { hexToArrayBuffer } from "../../../utils/string-utils";
import { AssetReader } from "../../AssetReader";
import { FGuid } from "../../modules/CoreUObject/structs/Guid";

import { FIoHash, HashNone } from "./IoHash";

describe("FIoHash", () => {
  test("none hash", () => {
    const ioHash = new FIoHash();
    expect(ioHash.toString()).toBe("0000000000000000000000000000000000000000");
    expect(ioHash.equals(HashNone)).toBe(true);
    expect(ioHash.isNone).toBe(true);
  });

  test("should throw an error for an invalid hash", () => {
    expect(() => FIoHash.fromHex("invalidhash")).toThrow("Invalid FIoHash");
    expect(() => FIoHash.fromHex("000000000000000000000000000000000000000z")).toThrow();
  });

  test("fromGuid", () => {
    const guid = FGuid.fromComponents(0x78563412, 0xfedcba98, 0xb2f1ebea, 0xb9a561a8);
    const hash = FIoHash.fromGuid(guid);
    expect(hash.toString()).toBe("1234567898badcfeeaebf1b2a861a5b900000000");
    expect(hash.toGuid().equals(guid)).toBe(true);
  });

  it("should deserialize from a stream", () => {
    const dataView = hexToArrayBuffer("11223da6ccf66409fe11b3306e1dc915cadd0188");
    expect(dataView.byteLength).toBe(20);
    const reader = new AssetReader(new DataView(dataView.buffer));
    const hash = FIoHash.fromStream(reader);
    expect(hash.toString()).toBe("11223da6ccf66409fe11b3306e1dc915cadd0188");
    expect(reader.getRemaining()).toBe(0);
  });

  it("shoukd throw an error for invalid stream data", () => {
    expect(() => hexToArrayBuffer("2")).toThrow();
    expect(() => hexToArrayBuffer("4g")).toThrow();
  });
});
