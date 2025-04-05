import type { AssetReader } from "../../../AssetReader";
import type { FName } from "../../../types/Name";

type FPerPlatformValue = {
  platform: FName;
  value: number;
};

export class FPerPlatformFloat {
  constructor(
    public Default: number,
    public PerPlatform: FPerPlatformValue[],
  ) {}

  static fromStream(reader: AssetReader) {
    const cooked = reader.readBoolean();
    const defaultValue = reader.readFloat();
    const perPlatform: FPerPlatformValue[] = [];
    if (!cooked) {
      const count = reader.readInt32();
      for (let i = 0; i < count; i++) {
        const platform = reader.readName();
        const value = reader.readFloat();
        perPlatform.push({ platform, value });
      }
    }
    return new FPerPlatformFloat(defaultValue, perPlatform);
  }

  toString() {
    return this.Default.toString();
  }
}
