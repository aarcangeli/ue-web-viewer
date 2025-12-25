import fs from "fs";

import type { LayoutDump } from "./LayoutDumpSchema";
import { PartialClassGenerator } from "./PartialClassGenerator";
import { ExportLayoutOptions } from "./Options";
import { generateIndex } from "./generate-index.js";

function main() {
  console.log("Reading layout dump...");
  console.log(`Repository root: ${ExportLayoutOptions.repoRoot}`);
  console.log(`Layout dump path: ${ExportLayoutOptions.layoutPath}`);
  console.log(`Output directory: ${ExportLayoutOptions.modulesDir}`);

  fs.mkdirSync(ExportLayoutOptions.modulesDir, { recursive: true });

  const values = JSON.parse(fs.readFileSync(ExportLayoutOptions.layoutPath, "utf-8")) as LayoutDump;

  const generator = new PartialClassGenerator(ExportLayoutOptions.modulesDir, values);

  // First of all, update existing TS classes
  generator.updateExistingSymbols();

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

  // Export the index file
  generateIndex();
}

main();
