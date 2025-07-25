# ExtractVersions

Generates the following files in the `src/unreal-engine/versioning` directory:

- `ue-versions.ts`: Which contains `EUnrealEngineObjectUE4Version` and `EUnrealEngineObjectUE5Version`

## How to run

From the root of the repository, run:

```bash
python scripts/ExtractVersions/main.py <ue_path>
```
