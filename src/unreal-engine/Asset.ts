import { AssetReader, FullAssetReader } from "./AssetReader";
import { FPackageFileSummary } from "./structs/PackageFileSummary";
import { FObjectImport } from "./structs/ObjectImport";
import { FObjectExport } from "./structs/ObjectExport";
import invariant from "tiny-invariant";
import { EUnrealEngineObjectUE4Version } from "./versioning/ue-versions";

/**
 * Permits to read the content of a package file.
 */
export class FAsset {
  summary: FPackageFileSummary = new FPackageFileSummary();
  imports: FObjectImport[] = [];
  exports: FObjectExport[] = [];

  /**
   * Reads the content of the asset from a stream.
   * Note: the reader is mutated.
   */
  static fromStream(reader: FullAssetReader) {
    invariant(reader.tell() === 0, "Expected to be at the beginning of the stream");

    const result = new FAsset();

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
