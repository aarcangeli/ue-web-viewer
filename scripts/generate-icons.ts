import { readdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { join, parse } from "path";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node generate-icons.js <sourceDir> <outputFile>");
    process.exit(1);
  }

  const iconsDir = join(process.cwd(), args[0]);
  const outFile = join(process.cwd(), args[1]);

  const files = await readdir(iconsDir);

  const svgFiles = files.filter((f) => f.toLowerCase().endsWith(".svg"));

  // Generate import statements
  const imports = svgFiles
    .map((file) => {
      const { name } = parse(file);

      const exportName = `${name}Icon`;

      return `export { default as ${exportName} } from "./icons/${name}.svg?react";`;
    })
    .join("\n");

  await writeFile(outFile, imports + "\n");
  console.log(`Generated ${outFile} with ${svgFiles.length} icons.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
