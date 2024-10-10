import path from "path";
import fs from "fs";
import { FullAssetReader } from "../AssetReader";
import { Asset } from "../serialization/Asset";

/**
 * Contains the path of __tests__ directory.
 * Used for relative path resolution.
 */
export const fixtures_path = path.resolve(__dirname, "__fixtures__");

/**
 * If the filename is relative, resolve it to the fixtures directory.
 * Otherwise, return the filename as is.
 * @param filename
 */
export function getFixturePath(filename: string) {
  if (path.isAbsolute(filename)) {
    return filename;
  }
  return path.join(fixtures_path, filename);
}

/**
 * Read and parse asset file.
 * @param filename
 */
export function readAsset(filename: string) {
  const fullPath = getFixturePath(filename);
  const fileData = fs.readFileSync(fullPath);
  const reader = new FullAssetReader(new DataView(fileData.buffer, 0, fileData.byteLength));
  const packageName = path.basename(filename, path.extname(filename));
  return new Asset(packageName, reader);
}
