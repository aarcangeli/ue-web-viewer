import fs from "fs";
import path from "path";
import url from "url";

/**
 * Generates a TypeScript file that exports the decompressor function based on the presence of the Oodle library.
 * The output is generated in src/external/index.ts.
 */
async function main() {
  const rootDirectory = path.resolve(url.fileURLToPath(import.meta.url), "..", "..");
  const externalDir = path.join(rootDirectory, "src", "externals");
  console.log(`Generating externals in '${externalDir}'...`);

  const output = generateFile(externalDir);

  fs.mkdirSync(externalDir, { recursive: true });
  fs.writeFileSync(path.resolve(externalDir, "index.ts"), output);
}

function generateFile(externalDir: string) {
  const withDecompressor = fs.existsSync(path.join(externalDir, "decompressor", "decompressor-api.ts"));

  let output = `// This file is auto-generated. Do not edit directly.\n\n`;

  if (withDecompressor) {
    output += `export { decompress } from "./decompressor/decompressor-api.js";\n`;
  } else {
    output += "// oodle is not included in the build.\n";
    output += `type DecompressFn = (data: Uint8Array, size: number) => Promise<Uint8Array>;\n`;
    output += `const decompress: DecompressFn | null = null;\n`;
    output += `export { decompress };\n`;
  }

  return output;
}

main().catch((error) => {
  console.error("Error generating externals:", error);
  process.exit(1);
});
