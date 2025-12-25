import path from "path";

import { getStructName } from "./property-handler";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "..", "..");
const src_dir = path.resolve(repoRoot, "src");

export const ExportLayoutOptions = {
  verbose: true,
  enforcePropertyOrder: true,
  enforceEnumOrder: true,
  overrideJSDoc: false,

  /**
   * Sort imports by file path.
   */
  organizeImports: true,

  /**
   * List of UCLASS that will be exported to TypeScript.
   */
  interestingTypes: ["StaticMesh"],

  repoRoot: repoRoot,
  layoutPath: path.join(dirname, "LayoutDump.json"),
  modulesDir: path.join(repoRoot, "src/unreal-engine/modules"),

  /**
   * Unreal Engine's LWC system uses different types for float and double precision (e.g., FVector3f vs FVector3d).
   * In TypeScript, we unify both to the double-precision version (e.g., FVector) to simplify the type system
   * and avoid unnecessary branching in code generation.
   * The list is at MathFwd.h
   */
  lwcRemaps: new Map<string, string>([
    ["FVector3f", "FVector"],
    ["FVector3d", "FVector"],
    ["FVector2f", "FVector2D"],
    ["FVector4f", "FVector4"],
    ["FVector4d", "FVector4"],
    ["FQuat4f", "FQuat"],
    ["FQuat4d", "FQuat"],
    ["FMatrix44f", "FMatrix"],
    ["FMatrix44d", "FMatrix"],
    ["FPlane4f", "FPlane"],
    ["FPlane4d", "FPlane"],
    ["FTransform3f", "FTransform"],
    ["FTransform3d", "FTransform"],
    ["FSphere3f", "FSphere"],
    ["FSphere3d", "FSphere"],
    ["FBox3f", "FBox"],
    ["FBox3d", "FBox"],
    ["FBox2f", "FBox2D"],
    ["FRotator3f", "FRotator"],
    ["FRotator3d", "FRotator"],
    ["FRay3f", "FRay"],
    ["FRay3d", "FRay"],
    ["FBoxSphereBounds3f", "FBoxSphereBounds"],
    ["FBoxSphereBounds3d", "FBoxSphereBounds"],
  ]),

  /**
   * Applies naming conventions to improve consistency in generated code.
   */
  structRenames: new Map<string, string>([
    ["FVector2D", "FVector2"],
    ["FVector", "FVector3"],
    ["FMatrix", "FMatrix44"],
  ]),

  additionalPaths: [
    path.resolve(src_dir, "unreal-engine/types/Name.ts"),
    path.resolve(src_dir, "unreal-engine/types/class-registry.ts"),
  ],
};

// invert matrix for structRenames
export const InvertedStructRenames = new Map<string, string>(
  [...ExportLayoutOptions.structRenames.entries()].map(([key, value]) => [value, key]),
);

export function logChange(message: string) {
  if (ExportLayoutOptions.verbose) {
    console.log(`  - ${message}`);
  }
}

/**
 * Get the name that we should use for the TypeScript class.
 */
export function getTypescriptName(structName: string): string {
  let prefixedName = getStructName(structName);
  prefixedName = ExportLayoutOptions.lwcRemaps.get(prefixedName) ?? prefixedName;
  prefixedName = ExportLayoutOptions.structRenames.get(prefixedName) ?? prefixedName;
  return prefixedName.substring(1); // Remove the leading 'F'
}

/**
 * Get the name that we should use for the TypeScript class.
 */
export function getUhtName(structName: string): string {
  let prefixedName = getStructName(structName);
  prefixedName = InvertedStructRenames.get(prefixedName) ?? prefixedName;
  return prefixedName.substring(1); // Remove the leading 'F'
}
