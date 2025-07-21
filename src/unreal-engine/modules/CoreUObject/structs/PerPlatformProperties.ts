import type { AssetReader } from "../../../AssetReader";
import { FNameMap } from "../../../types/Name";

export class FPerPlatformFloat {
  Default: number = 0;
  PerPlatform: FNameMap<number> = new FNameMap();

  static fromStream(reader: AssetReader) {
    const result = new FPerPlatformFloat();
    const cooked = reader.readBoolean();
    result.Default = reader.readFloat();
    if (!cooked) {
      const count = reader.readInt32();
      for (let i = 0; i < count; i++) {
        const platform = reader.readName();
        const value = reader.readFloat();
        result.PerPlatform.set(platform, value);
      }
    }
    return result;
  }

  toString() {
    return this.Default.toString();
  }
}

export class FPerPlatformInt {
  Default: number = 0;
  PerPlatform: FNameMap<number> = new FNameMap();

  static fromStream(reader: AssetReader) {
    const result = new FPerPlatformInt();
    const cooked = reader.readBoolean();
    result.Default = reader.readInt32();

    if (!cooked) {
      const count = reader.readInt32();
      for (let i = 0; i < count; i++) {
        const platform = reader.readName();
        const value = reader.readInt32();
        result.PerPlatform.set(platform, value);
      }
    }

    return result;
  }
}
