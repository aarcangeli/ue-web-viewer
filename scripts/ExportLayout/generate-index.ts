import { ExportLayoutOptions } from "./Options";
import { getAllTsFiles } from "./SymbolStorage";
import type { SourceFile } from "ts-morph";
import { IndentationText, Project } from "ts-morph";
import path from "path";
import { createModuleImport } from "./ts-utils";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

/**
 * Returns true if the source file contains a class with the `RegisterClass` decorator.
 * @param sourceFile The source file to check.
 */
function containsRegisterClass(sourceFile: SourceFile) {
  for (const classDeclaration of sourceFile.getClasses()) {
    if (classDeclaration.getDecorator("RegisterClass")) {
      return true;
    }
  }
}

export function generateIndex() {
  const outputFile = path.resolve(ExportLayoutOptions.repoRoot, "src/unreal-engine/modules/all-objects.ts");
  console.log(`Generating index file at '${outputFile}'`);

  const project = new Project({
    manipulationSettings: { indentationText: IndentationText.TwoSpaces },
  });

  const file = project.addSourceFileAtPath(outputFile);

  for (const tsFile of getAllTsFiles(ExportLayoutOptions.modulesDir)) {
    const sourceFile = project.addSourceFileAtPath(tsFile);
    if (containsRegisterClass(sourceFile)) {
      createModuleImport(file, sourceFile);
    }
  }

  file.organizeImports();
  file.saveSync();
}

if (process.argv[1] === __filename) {
  generateIndex();
}
