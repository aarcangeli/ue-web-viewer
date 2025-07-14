export interface LayoutDump {
  packages: Array<PackageInfo>;
}

interface PackageInfo {
  packageName: string;
  classes: Array<ClassInfo>;
  structs: Array<StructInfo>;
}

type BaseProperty<Name extends string> = {
  type: Name;
};

type ChildPropertyInfo =
  | BaseProperty<"ByteProperty">
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
  | (BaseProperty<"ArrayProperty"> & { valueType: ChildPropertyInfo })
  | (BaseProperty<"MapProperty"> & {
      keyType: ChildPropertyInfo;
      valueType: ChildPropertyInfo;
    })
  | (BaseProperty<"SetProperty"> & { valueType: ChildPropertyInfo })
  | (BaseProperty<"StructProperty"> & { structType: StructRef })
  | BaseProperty<"DelegateProperty">
  | BaseProperty<"MulticastInlineDelegateProperty">
  | BaseProperty<"MulticastSparseDelegateProperty">
  | BaseProperty<"TextProperty">
  | (BaseProperty<"EnumProperty"> & { valueType: ChildPropertyInfo })
  | BaseProperty<"FieldPathProperty">
  | (BaseProperty<"OptionalProperty"> & { valueType: ChildPropertyInfo })

  // New in UE 5.5
  | BaseProperty<"Utf8StrProperty">
  | BaseProperty<"AnsiStrProperty">;

type PropertyInfo = ChildPropertyInfo & {
  name: string;
  arrayDim?: number;
};

interface ClassInfo {
  className: string;
  superClass: ClassRef | null;
  properties: Array<PropertyInfo>;
}

interface StructInfo {
  structName: string;
  properties: Array<PropertyInfo>;
}

interface ClassRef {
  package: string;
  class: string;
}

interface StructRef {
  package: string;
  struct: string;
}
