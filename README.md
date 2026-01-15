# Unreal Engine Web Viewer

[![CI](https://github.com/aarcangeli/ue-web-viewer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/aarcangeli/ue-web-viewer/actions/workflows/ci.yml)
[![Deploy](https://github.com/aarcangeli/ue-web-viewer/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/aarcangeli/ue-web-viewer/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/aarcangeli/ue-web-viewer/graph/badge.svg?token=P1hMikF7G4)](https://codecov.io/gh/aarcangeli/ue-web-viewer)

[Open App](https://aarcangeli.github.io/ue-web-viewer/)

## Download and run the project

```bash
git clone git@github.com:aarcangeli/ue-web-viewer.git
cd ue-web-viewer
yarn install
yarn build
yarn preview
```

## Start the project in development mode

```bash
yarn dev
```

After a patch, verify that everything is working correctly by running:

```bash
yarn check
```

This single command executes type checking, linting, tests and pre-commit hooks.

## Useful stuff

```
PackageTools.ReloadPackage /Game/BP_SimpleProperties
UE_IMPLEMENT_STRUCT("/Script/CoreUObject", Vector4);
UClass::SerializeDefaultObject serializes the default object of a class
UStruct::SerializeVersionedTaggedProperties serializes tagged properties
```

### What to do when the engine is updated:

1. Clone unreal engine in a local repository
2. Run `python scripts/ExtractVersions/main.py <ue_path>` (More details on his [README.md](scripts/ExtractVersions/README.md))
3. Run `pre-commit run -a`
4. Inspect the diff, and verify if added versions need to be updated in local directory.

   - Check new versions in `EUnrealEngineObjectUE4Version` and `EUnrealEngineObjectUE5Version`
   - Check new custom versions as well.
   - If a new code is added involving version checks, port the code to TypeScript.

   ```c++
     if (Sum.FileVersionUE >= EUnrealEngineObjectUE5Version::Never)
     {
         // This is probably a code you need to port to Typescript
         Ar << NewProperty;
     }
   ```
