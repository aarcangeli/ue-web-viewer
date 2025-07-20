import fs from "fs";
import path from "path";

import type {
  ClassInfo,
  ClassRef,
  EnumInfo,
  EnumRef,
  LayoutDump,
  PackageInfo,
  StructInfo,
  StructRef,
} from "./LayoutDumpSchema";
import { EPropertyFlags } from "../../src/unreal-engine/properties/enums";
import invariant from "tiny-invariant";
import { PartialClassGenerator } from "./PartialClassGenerator";
import { ExportLayoutOptions } from "./Options";

// Get some paths
const dirname = __dirname;
const layoutPath = path.join(dirname, "LayoutDump.json");
const repoRoot = path.resolve(dirname, "..", "..");
const outputDir = path.join(repoRoot, "src/unreal-engine/modules");

function main() {
  console.log("Reading layout dump...");
  console.log(`Repository root: ${repoRoot}`);
  console.log(`Layout dump path: ${layoutPath}`);
  console.log(`Output directory: ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  const values = JSON.parse(fs.readFileSync(layoutPath, "utf-8")) as LayoutDump;

  const generator = new PartialClassGenerator(outputDir, values);

  // First of all, update existing TS classes
  // generator.updateExistingSymbols();

  for (const aPackage of values.packages) {
    for (const aClass of aPackage.classes) {
      if (ExportLayoutOptions.interestingTypes.indexOf(aClass.className) !== -1) {
        generator.syncClass(aClass);
      }
    }
  }

  generator.processQueue();

  if (ExportLayoutOptions.organizeImports) {
    generator.organizeImports();
  }

  generator.flushSaves();
}

main();
