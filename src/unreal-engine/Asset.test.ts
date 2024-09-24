import * as fs from "fs";
import * as path from "path";
import { FullAssetReader } from "./AssetReader";
import { Asset } from "./Asset";

// Memo: use custom serializer if needed
// TODO: move this in some documentation for developers
// expect.addSnapshotSerializer({
//   test: (val) => val instanceof FGuid,
//   serialize: (val: FGuid, config, indentation, depth, refs, printer) => {
//     return printer(val.toString(), config, indentation, depth, refs);
//   },
// });

// Try to load an asset saved with UE4.0.2
describe("TestActorUE4-0-2", () => {
  let asset: Asset;

  // Load asset file once
  beforeAll(() => {
    asset = readAsset("./__tests__/TestActorUE4-0-2.uasset");
  });

  test("Read MyBasicActor", () => {
    expect(asset.summary).toMatchSnapshot("summary");
    expect(asset.imports).toMatchSnapshot("imports");
    expect(asset.exports).toMatchSnapshot("exports");
  });

  test("getObjectName", () => {
    expect(asset.getObjectName(0)).toBe("None");
    expect(asset.getObjectName(1)).toBe("K2Node_Event_DeltaSeconds");
    expect(asset.getObjectName(-1)).toBe("Default__Actor");
  });

  test("makeFullName", () => {
    expect(asset.makeFullName(0)).toBe("None");
    expect(asset.makeFullName(55)).toBe("TestActorUE4-0-2.TestActorUE4-0-2:CustomFunction.K2Node_CallFunction_7632");
    expect(asset.makeFullName(-36)).toBe("/Script/CoreUObject.Object:LinearColor");
  });
});

// Try to load an asset saved with UE4.0.2
describe("TestActorUE5-4-4", () => {
  let asset: Asset;

  // Load asset file once
  beforeAll(() => {
    asset = readAsset("./__tests__/TestActorUE5-4-4.uasset");
  });

  test("Read MyBasicActor", () => {
    expect(asset.summary).toMatchSnapshot("summary");
    expect(asset.imports).toMatchSnapshot("imports");
    expect(asset.exports).toMatchSnapshot("exports");
  });

  test("getObjectName", () => {
    expect(asset.getObjectName(0)).toBe("None");
    expect(asset.getObjectName(1)).toBe("TestActorUE5-4-4");
    expect(asset.getObjectName(-1)).toBe("Default__Actor");
  });

  test("makeFullName", () => {
    expect(asset.makeFullName(0)).toBe("None");
    expect(asset.makeFullName(14)).toBe("TestActorUE5-4-4.TestActorUE5-4-4:CustomGraph.K2Node_CallFunction_1");
    expect(asset.makeFullName(-21)).toBe("/Script/Engine.KismetSystemLibrary:PrintString");
  });
});

/**
 * Read and parse asset file.
 * @param filename
 */
function readAsset(filename: string) {
  const fullPath = path.join(__dirname, filename);
  const fileData = fs.readFileSync(fullPath);
  const reader = new FullAssetReader(fileData.buffer);
  const packageName = path.basename(filename, path.extname(filename));
  return Asset.fromStream(packageName, reader);
}
