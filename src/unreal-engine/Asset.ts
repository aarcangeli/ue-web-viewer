import { AssetReader, FullAssetReader } from "./AssetReader";
import { FPackageFileSummary } from "./structs/PackageFileSummary";
import { FObjectImport } from "./structs/ObjectImport";
import { FObjectExport } from "./structs/ObjectExport";
import invariant from "tiny-invariant";
import { EUnrealEngineObjectUE4Version } from "./versioning/ue-versions";
import { FName, NAME_None } from "./structs/Name";

/**
 * Permits to read the content of a package file.
 */
export class Asset {
  packageName: string = "";
  summary: FPackageFileSummary = new FPackageFileSummary();
  imports: FObjectImport[] = [];
  exports: FObjectExport[] = [];

  /**
   * Reads the content of the asset from a stream.
   * Note: the reader is mutated.
   */
  static fromStream(packageName: string, reader: FullAssetReader) {
    invariant(packageName, "Expected a package name");
    invariant(reader.tell() === 0, "Expected to be at the beginning of the stream");

    const result = new Asset();
    result.packageName = packageName;

    // read summary, and set file version for the reader
    let summary = FPackageFileSummary.fromStream(reader);
    reader.setVersion(summary.FileVersionUE4, summary.FileVersionUE5);
    result.summary = summary;

    // read names, and set them in the reader so that can be used to read names from indexes
    reader.setNames(readNames(reader, summary));

    // Read other tables
    result.imports = readImportMap(reader, summary);
    result.exports = readExportMap(reader, summary);

    return result;
  }

  makeFullName(index: number): string {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index == 0) {
      return "None";
    }

    const parts = [];

    const initialIndex = index;
    while (index !== 0) {
      parts.push(this.getObjectName(index));
      index = this.getOuterIndex(index);
    }

    // Exports must begin with the package name
    if (isExportIndex(initialIndex)) {
      parts.push(this.packageName);
    }

    let result = "";
    parts.reverse().forEach((part, index) => {
      if (index > 0) {
        result += index == 2 ? ":" : ".";
      }
      result += part;
    });
    return result;
  }

  getObjectName(index: number): FName {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index < 0) {
      return this.imports[-index - 1].ObjectName;
    } else if (index > 0) {
      return this.exports[index - 1].ObjectName;
    } else {
      return NAME_None;
    }
  }

  private isIndexValid(index: number) {
    return index >= -this.imports.length && index <= this.exports.length;
  }

  private getOuterIndex(index: number) {
    invariant(this.isIndexValid(index), `Invalid index ${index}`);

    if (index < 0) {
      return this.imports[-index - 1].OuterIndex;
    } else if (index > 0) {
      return this.exports[index - 1].OuterIndex;
    } else {
      return 0;
    }
  }
}

function readNames(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.NameOffset);

  const names = [];
  for (let i = 0; i < summary.NameCount; i++) {
    names.push(reader.readString());

    // skip hash
    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_NAME_HASHES_SERIALIZED) {
      reader.readUInt32();
    }
  }
  return names;
}

function readImportMap(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.ImportOffset);

  const imports = [];
  for (let i = 0; i < summary.ImportCount; i++) {
    const value = FObjectImport.fromStream(reader);
    imports.push(value);
  }
  return imports;
}

function readExportMap(reader: AssetReader, summary: FPackageFileSummary) {
  reader.seek(summary.ExportOffset);

  const exports = [];
  for (let i = 0; i < summary.ExportCount; i++) {
    const value = FObjectExport.fromStream(reader);
    exports.push(value);
  }
  return exports;
}

function isExportIndex(index: number) {
  return index > 0;
}
