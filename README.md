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

## Useful stuff

```
PackageTools.ReloadPackage /Game/BP_SimpleProperties
UE_IMPLEMENT_STRUCT("/Script/CoreUObject", Vector4);
UClass::SerializeDefaultObject serializes the default object of a class
UStruct::SerializeVersionedTaggedProperties serializes tagged properties
```

## Documentation

Always document your code.

On typescript, use JSDoc comments [Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).

## Can I use public field on typescript?

Yes, you can.

If you realize that a setter became necessary,
you can replace the public field with a private field and a getter/setter without changing the class interface.

Example:

```typescript
export class MyClass {
  private _myField: number = 0;

  get myField(): number {
    return this._myField;
  }

  set myField(value: number) {
    this._myField = value;
  }
}
```
