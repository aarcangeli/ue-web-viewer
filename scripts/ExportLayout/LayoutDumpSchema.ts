export interface LayoutDump {
  packages: Array<PackageInfo>;
}

export interface PackageInfo {
  packageName: string;
  classes: Array<ClassInfo>;
  structs: Array<StructInfo>;
  enums: Array<EnumInfo>;
}

type BaseProperty<Name extends string> = {
  type: Name;
};

export type ChildPropertyInfo =
  | (BaseProperty<"ByteProperty"> & { enumType?: EnumRef })
  | BaseProperty<"Int8Property">
  | BaseProperty<"Int16Property">
  | BaseProperty<"IntProperty">
  | BaseProperty<"Int64Property">
  | BaseProperty<"UInt16Property">
  | BaseProperty<"UInt32Property">
  | BaseProperty<"UInt64Property">
  | BaseProperty<"FloatProperty">
  | BaseProperty<"DoubleProperty">
  | BaseProperty<"BoolProperty">
  | (BaseProperty<"ObjectProperty"> & { objectType: ClassRef })
  | BaseProperty<"WeakObjectProperty">
  | BaseProperty<"LazyObjectProperty">
  | BaseProperty<"SoftObjectProperty">
  | BaseProperty<"ClassProperty">
  | BaseProperty<"SoftClassProperty">
  | BaseProperty<"InterfaceProperty">
  | BaseProperty<"NameProperty">
  | BaseProperty<"StrProperty">
  | (BaseProperty<"ArrayProperty"> & { innerType: ChildPropertyInfo })
  | (BaseProperty<"MapProperty"> & {
      keyType: ChildPropertyInfo;
      valueType: ChildPropertyInfo;
    })
  | (BaseProperty<"SetProperty"> & { elementType: ChildPropertyInfo })
  | (BaseProperty<"StructProperty"> & { structType: StructRef })
  | BaseProperty<"DelegateProperty">
  | BaseProperty<"MulticastInlineDelegateProperty">
  | BaseProperty<"MulticastSparseDelegateProperty">
  | BaseProperty<"TextProperty">
  | (BaseProperty<"EnumProperty"> & { enumType: EnumRef })
  | BaseProperty<"FieldPathProperty">
  | (BaseProperty<"OptionalProperty"> & { valueType: ChildPropertyInfo })

  // New in UE 5.5
  | BaseProperty<"Utf8StrProperty">
  | BaseProperty<"AnsiStrProperty">;

export type PropertyInfo = ChildPropertyInfo & {
  name: string;
  flagsLower: number;
  flagsUpper: number;
  arrayDim?: number;
};

export interface ClassInfo {
  className: string;
  packageName: string;
  superClass: ClassRef | null;
  properties: Array<PropertyInfo>;
}

export interface StructInfo {
  structName: string;
  packageName: string;
  superStruct: StructRef | null;
  properties: Array<PropertyInfo>;
}

export interface EnumInfo {
  enumName: string;
  packageName: string;
  enumFlags: number;
  values: [{ name: string; value: number }];
}

export interface ClassRef {
  package: string;
  class: string;
}

export interface EnumRef {
  package: string;
  enum: string;
}

export interface StructRef {
  package: string;
  struct: string;
}
