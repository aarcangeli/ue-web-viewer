import path from "path";
import fs from "fs";
import { openAssetFromDataView } from "../serialization/Asset";
import { FName } from "../types/Name";
import { afterAll, beforeAll, expect } from "vitest";
import { globalContainer, setGlobalContainer } from "../global-container";
import { type Container, createContainer } from "../container";
import invariant from "tiny-invariant";

/**
 * Contains the path of __tests__ directory.
 * Used for relative path resolution.
 */
export const fixtures_path = path.resolve(__dirname, "__fixtures__");

/**
 * If the filename is relative, resolve it to the __fixtures__ directory.
 * Otherwise, return the filename as is.
 * @param filename
 */
export function getFixturePath(filename: string) {
  if (path.isAbsolute(filename)) {
    return filename;
  }
  return path.join(fixtures_path, filename);
}

export function withGlobalEnv() {
  let currentEnvironment: Container | undefined;

  beforeAll(() => {
    expect(globalContainer).toBeUndefined();

    currentEnvironment = createContainer();
    setGlobalContainer(currentEnvironment);

    expect(globalContainer).toBe(currentEnvironment);
  });

  afterAll(() => {
    expect(globalContainer).toBe(currentEnvironment);
    setGlobalContainer(undefined);
    expect(globalContainer).toBeUndefined();
  });
}

/**
 * Read and parse asset file.
 * @param filename Path to the asset file (see {@link getFixturePath} for resolution)
 */
export function readAsset(filename: string) {
  invariant(globalContainer);

  const fullPath = getFixturePath(filename);
  const fileData = fs.readFileSync(fullPath);
  const dataView = new DataView(fileData.buffer, 0, fileData.byteLength);
  const packageName = "/Game/" + path.basename(filename, path.extname(filename));
  return openAssetFromDataView(globalContainer.context, FName.fromString(packageName), dataView);
}
