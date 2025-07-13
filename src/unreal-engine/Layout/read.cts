import fs from "fs";

interface PackageInfo {
  packageName: string;
  classes: Array<ClassInfo>;
  structs: Array<StructInfo>;
}

interface LayoutDump {
  packages: Array<PackageInfo>;
}

type BaseValue<Name extends string> = {
  type: Name;
  arrayDim?: number;
};

type PropertyInfo =
  | BaseValue<"ByteProperty">
  | BaseValue<"Int8Property">
  | BaseValue<"Int16Property">
  | BaseValue<"IntProperty">
  | BaseValue<"Int64Property">
  | BaseValue<"UInt16Property">
  | BaseValue<"UInt32Property">
  | BaseValue<"UInt64Property">
  | BaseValue<"FloatProperty">
  | BaseValue<"DoubleProperty">
  | BaseValue<"BoolProperty">
  | (BaseValue<"ObjectProperty"> & { objectType: ClassRef })
  | BaseValue<"WeakObjectProperty">
  | BaseValue<"LazyObjectProperty">
  | BaseValue<"SoftObjectProperty">
  | BaseValue<"ClassProperty">
  | BaseValue<"SoftClassProperty">
  | BaseValue<"InterfaceProperty">
  | BaseValue<"NameProperty">
  | BaseValue<"StrProperty">
  | (BaseValue<"ArrayProperty"> & { valueType: PropertyInfo })
  | (BaseValue<"MapProperty"> & { keyType: PropertyInfo; valueType: PropertyInfo })
  | (BaseValue<"SetProperty"> & { valueType: PropertyInfo })
  | (BaseValue<"StructProperty"> & { structType: StructRef })
  | BaseValue<"DelegateProperty">
  | BaseValue<"MulticastInlineDelegateProperty">
  | BaseValue<"MulticastSparseDelegateProperty">
  | BaseValue<"TextProperty">
  | (BaseValue<"EnumProperty"> & { valueType: PropertyInfo })
  | BaseValue<"FieldPathProperty">
  | (BaseValue<"OptionalProperty"> & { valueType: PropertyInfo })

  // New in UE 5.5
  | BaseValue<"Utf8StrProperty">
  | BaseValue<"AnsiStrProperty">;

interface ClassInfo {
  className: string;
  properties: Record<string, PropertyInfo>;
  defaultObject: unknown;
}

interface StructInfo {
  structName: string;
  properties: Record<string, PropertyInfo>;
}

interface ClassRef {
  package: string;
  class: string;
}

interface StructRef {
  package: string;
  struct: string;
}

const values = JSON.parse(fs.readFileSync("LayoutDump.json", "utf-8")) as LayoutDump;
