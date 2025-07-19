import fs from "fs";
import path from "path";

import { LayoutDump } from "./LayoutDumpSchema";

// Get some paths
const layoutPath = path.join(__dirname, "LayoutDump.json");
const repoRoot = path.resolve(__dirname, "..", "..");
const outputDir = path.join(repoRoot, "src/unreal-engine/Layout");

function main() {
  console.log("Reading layout dump...");
  console.log(`Repository root: ${repoRoot}`);
  console.log(`Layout dump path: ${layoutPath}`);
  console.log(`Output directory: ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  const values = JSON.parse(fs.readFileSync(layoutPath, "utf-8")) as LayoutDump;
  console.log(values);
}

main();
