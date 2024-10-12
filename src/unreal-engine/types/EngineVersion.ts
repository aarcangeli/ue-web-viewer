import type { AssetReader } from "../AssetReader";

/**
 * struct FEngineVersion {
 *     uint16 Major{};
 *     uint16 Minor{};
 *     uint16 Patch{};
 *     uint32 Changelist{};
 *     FString Branch;
 * };
 */
export class FEngineVersion {
  Major: number = 0;
  Minor: number = 0;
  Patch: number = 0;
  Changelist: number = 0;
  Branch: string = "";

  static fromStream(reader: AssetReader) {
    const result = new FEngineVersion();
    result.Major = reader.readUInt16();
    result.Minor = reader.readUInt16();
    result.Patch = reader.readUInt16();
    result.Changelist = reader.readUInt32();
    result.Branch = reader.readString();
    return result;
  }

  static fromComponents(major: number, minor: number, patch: number, changelist: number, branch: string) {
    const result = new FEngineVersion();
    result.Major = major;
    result.Minor = minor;
    result.Patch = patch;
    result.Changelist = changelist;
    result.Branch = branch;
    return result;
  }

  /**
   * Returns a string representation of the version.
   * This is equivalent to the `ToString(EVersionComponent::Branch)` method in C++.
   */
  toString() {
    return `${this.Major}.${this.Minor}.${this.Patch}-${this.Changelist}` + (this.Branch ? `+${this.Branch}` : "");
  }

  toJSON() {
    return this.toString();
  }
}
