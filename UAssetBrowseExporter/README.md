# UAssetBrowseExporter

`UAssetBrowseExporter` is a plugin for Unreal Engine that enables:

- Exporting the "layout" of native property fields, including their types and default values.
- Export deserialized assets as JSON files, useful for testing the deserialization process.

## Installation

You can install the plugin in one of the following ways:

### Option 1: Copy the plugin into your project

opy the entire `UAssetBrowseExporter` directory into your project's `Plugins` folder.

### Option 2: Create a symbolic link to the plugin

From the repository root, run one of the following commands:

#### Windows (PowerShell)

If this fails, run PowerShell as administrator or enable _Developer Mode_ in Windows settings.

```PowerShell
$ueRoot = $(ue4 root)
$linkPath = Join-Path $ueRoot "Engine\Plugins\UAssetBrowseExporter"
$targetPath = (Resolve-Path "UAssetBrowseExporter").Path
New-Item -ItemType SymbolicLink -Path $linkPath -Target $targetPath
Write-Host "Symbolic link created at $linkPath pointing to $targetPath"
```

#### Linux/macOS (bash)

```bash
ue_root=$(ue4 root)
link_path="$ue_root/Engine/Plugins/UAssetBrowseExporter"
target_path="$(realpath UAssetBrowseExporter)"
ln -s "$target_path" "$link_path"
echo "Symbolic link created at $link_path pointing to $target_path"
```

### Option 3: Use `UE_ADDITIONAL_PLUGIN_PATHS`

Set the plugin path using the `UE_ADDITIONAL_PLUGIN_PATHS` environment variable:

## Export the classes of the engine:

To export the layout of engine classes:

```bash
ue4 build-target UnrealEditor Development
ue4 editor -run=ExportLayoutCommandlet -OutputDirectory=src/unreal-engine/Layout
```
