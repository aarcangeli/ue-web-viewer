import type { AssetReader } from "../../../AssetReader";
import { isShortPackageName, tryParseExportTextPath } from "../../../../utils/path-utils";
import { FName, NAME_None } from "../../../types/Name";
import {
  FFortniteMainBranchObjectVersion,
  FFortniteMainBranchObjectVersionGuid,
} from "../../../versioning/custom-versions-enums/FFortniteMainBranchObjectVersion";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../../../versioning/ue-versions";
import type { UObject } from "../objects/Object";
import invariant from "tiny-invariant";

/**
 * Represents the full path to an object, so that it can be loaded on demand.
 *
 * This class is usually serialized with virtual operator<< from FArchive.
 * The specific implementation of FArchive is responsible for reading/writing the data.
 *
 * LayoutGenerator: ignore
 */
export class FSoftObjectPath {
  packageName: FName;
  assetName: FName;
  subPathString: string;

  constructor(packageName: FName = NAME_None, assetName: FName = NAME_None, subPathString: string = "") {
    this.packageName = packageName;
    this.assetName = assetName;
    this.subPathString = subPathString;

    // Assertions
    if (this.packageName.isNone) {
      invariant(
        this.assetName.isNone,
        `Invalid FSoftObjectPath: packageName is None but assetName is ${this.assetName}`,
      );
    }
    if (this.assetName.isNone) {
      invariant(
        !this.subPathString,
        `Invalid FSoftObjectPath: assetName is None but subPathString is ${this.subPathString}`,
      );
    }
    invariant(
      this.subPathString.trim() === this.subPathString,
      "subPathString should not have leading or trailing spaces",
    );
  }

  // This is not used ATM, but may be used in the future.
  static fromStream(reader: AssetReader) {
    if (reader.fileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_ADDED_SOFT_OBJECT_PATH) {
      // Single string
      let assetPath = reader.readString();

      if (
        reader.fileVersionUE4 <
        EUnrealEngineObjectUE4Version.VER_UE4_KEEP_ONLY_PACKAGE_NAMES_IN_STRING_ASSET_REFERENCES_MAP
      ) {
        assetPath = getNormalizedObjectPath(assetPath);
      }

      return this.fromPathString(assetPath);
    } else if (reader.fileVersionUE5 < EUnrealEngineObjectUE5Version.FSOFTOBJECTPATH_REMOVE_ASSET_PATH_FNAMES) {
      // Package name and asset name merged into a single FName, followed by a string
      const [packageName, assetName] = splitPath(reader.readName());
      const subPathString = reader.readString();
      return new FSoftObjectPath(packageName, assetName, subPathString);
    } else if (
      reader.getCustomVersion(FFortniteMainBranchObjectVersionGuid) <
      FFortniteMainBranchObjectVersion.SoftObjectPathUtf8SubPaths
    ) {
      // Package name, asset name, and sub-path string separately
      const assetPathName = reader.readName();
      const assetName = reader.readName();
      // Note: UE uses a workaround to know if the subPathString is UTF-8 encoded or not.
      // We trust that the version is correct and read the subPathString accordingly.
      const subPathString = reader.readString();
      return new FSoftObjectPath(assetPathName, assetName, subPathString);
    } else {
      // The subPathString, is now UTF-8 encoded
      const assetPathName = reader.readName();
      const assetName = reader.readName();
      const subPathString = reader.readStringUtf8();
      return new FSoftObjectPath(assetPathName, assetName, subPathString);
    }
  }

  static fromObject(object: UObject): FSoftObjectPath {
    const parts = object.nameParts;
    return this.fromNameParts(parts);
  }

  public static fromNameParts(parts: FName[]) {
    const packageName = parts?.[0] ?? NAME_None;
    const assetName = parts?.[1] ?? NAME_None;
    const subPathString = parts.slice(2).join(".");
    return new FSoftObjectPath(packageName, assetName, subPathString);
  }

  static fromPathString(path: string): FSoftObjectPath {
    return this.fromPath(FName.fromString(path));
  }

  static fromPath(path: FName): FSoftObjectPath {
    if (path.isEmpty || path.isNone) {
      return new FSoftObjectPath(NAME_None, NAME_None, "");
    }

    let pathString = removeClassPrefix(path.text);

    if (!pathString.startsWith("/")) {
      throw new Error(`Invalid soft object path: ${pathString}`);
    }

    // Find the first '.' or ':'
    const i = pathString.match(/[.:]/)?.index ?? -1;
    if (i <= 0) {
      // Only package name
      return new FSoftObjectPath(FName.fromString(pathString), NAME_None, "");
    }

    const packageName = FName.fromString(pathString.substring(0, i));
    pathString = pathString.substring(i + 1);

    const j = pathString.match(/[.:]/)?.index ?? -1;
    if (j <= 0) {
      // Only package name and asset name, no sub-path
      return new FSoftObjectPath(packageName, FName.fromString(pathString), "");
    }

    const assetName = FName.fromString(pathString.substring(0, j));
    const subPathString = pathString.substring(j + 1);
    return new FSoftObjectPath(packageName, assetName, subPathString);
  }

  isNull() {
    return this.packageName.isNone;
  }

  toString() {
    if (this.isNull()) {
      return "null";
    }
    let result = "";
    result += this.packageName.text;
    if (!this.assetName.isNone) {
      result += "." + this.assetName.text;
      if (this.subPathString.length > 0) {
        result += ":" + this.subPathString;
      }
    }
    return result;
  }

  equals(other: FSoftObjectPath): boolean {
    return (
      this.packageName.equals(other.packageName) &&
      this.assetName.equals(other.assetName) &&
      this.subPathString.toLowerCase() === other.subPathString.toLowerCase()
    );
  }

  get summary(): string {
    return this.toString();
  }

  toJson() {
    return this.toString();
  }
}

function splitPath(path: FName): [FName, FName] {
  if (path.isEmpty || path.isNone) {
    return [NAME_None, NAME_None];
  }

  const pathString = removeClassPrefix(path.text);
  if (pathString.length === 0 || !path.startsWith("/")) {
    throw new Error(`Invalid soft object path: ${path}`);
  }

  const i = pathString.indexOf(".");
  if (i <= 0) {
    return [NAME_None, NAME_None];
  }

  if (i === pathString.length - 1) {
    // Reference to a package
    return [FName.fromString(pathString.substring(0, i)), NAME_None];
  }

  const [leftPart, rightPart] = [pathString.substring(0, i), pathString.substring(i + 1)];
  if (rightPart.includes(".") || rightPart.includes(":")) {
    // Multiple '.' or ':' are not allowed in the asset name.
    throw new Error(`Invalid soft object path: ${path}`);
  }

  return [FName.fromString(leftPart), FName.fromString(rightPart)];
}

function removeClassPrefix(path: string): string {
  const parsed = tryParseExportTextPath(path);
  if (parsed) {
    return parsed[1];
  }
  return path;
}

function getNormalizedObjectPath(assetPath: string) {
  if (assetPath && isShortPackageName(assetPath)) {
    // Short package doesn't store the directory, and we have no way to know it.
    throw new Error(`Cannot convert short package name to object path: ${assetPath}`);
  }
  return assetPath;
}
