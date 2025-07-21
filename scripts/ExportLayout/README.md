# ExportLayout

This script automatically generates TypeScript classes and enums from a `LayoutDump.json` file.

## What it does

The generated output includes:

- **Classes and Structs:**

  - Name
  - Non-transient properties only

- **Enums:**
  - Name
  - List of values

## Prerequisites

## Usage

1. Export the `LayoutDump.json` file.

   - For instructions, see [ue-plugins/UAssetBrowseExporter/README.md](../../ue-plugins/UAssetBrowseExporter/README.md)

2. IMPORTANT: check that there are no uncommitted changes.

3. Run the script using Yarn:

   ```shell
   yarn run export-layout
   ```

4. Check the generated files using git diff.
