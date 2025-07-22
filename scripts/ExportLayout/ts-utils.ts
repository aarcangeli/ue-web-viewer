import path from "path";
import type { SourceFile } from "ts-morph";

export function getOrCreateImport(
  sourceFile: SourceFile,
  destination: SourceFile,
  symbolName: string,
  asType: boolean,
) {
  if (sourceFile === destination) {
    // No need to import from the same file
    return;
  }

  const relativePath = getRelativeImportPath(sourceFile, destination.getFilePath());

  let importDecl = sourceFile.getImportDeclaration(
    (decl) =>
      decl.getModuleSpecifierValue() === relativePath &&
      decl.getNamedImports().find((i) => i.getName() === symbolName) !== undefined,
  );

  if (importDecl) {
    const alreadyImported = importDecl.getNamedImports().find((i) => i.getName() === symbolName);
    if (!alreadyImported) {
      importDecl.addNamedImport({
        name: symbolName,
        isTypeOnly: asType,
      });
    }

    // Remove the type-only flag if it was previously imported as type-only
    if (alreadyImported && !asType) {
      if (importDecl.isTypeOnly()) {
        if (importDecl.getNamedImports().length === 1) {
          importDecl.setIsTypeOnly(false);
        } else {
          // If there are other named imports, remove the item specifier and recreate a new import declaration
          alreadyImported.remove();
          importDecl = undefined;
        }
      } else if (alreadyImported.isTypeOnly()) {
        alreadyImported.setIsTypeOnly(false);
      }
    }
  }

  if (!importDecl) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: relativePath,
      isTypeOnly: asType,
      namedImports: [symbolName],
    });
  }
}

export function createModuleImport(sourceFile: SourceFile, destination: SourceFile) {
  if (sourceFile === destination) {
    // No need to import from the same file
    return;
  }

  const relativePath = getRelativeImportPath(sourceFile, destination.getFilePath());

  const importDecl = sourceFile.getImportDeclaration(relativePath);

  if (!importDecl) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: relativePath,
    });
  }
}

function getRelativeImportPath(from: SourceFile, toPath: string): string {
  const fromDir = path.dirname(from.getFilePath());

  let relPath = path.relative(fromDir, toPath).replace(/\\/g, "/");

  // Remove the file extension if it exists
  relPath = relPath.replace(/\.[tj]sx?$/, "");

  // Ensure the path starts with "./" if it doesn't already
  if (!relPath.startsWith(".")) {
    relPath = "./" + relPath;
  }

  return relPath;
}
