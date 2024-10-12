import { FName } from "../types/Name";

export enum EPropertyType {
  Unknown,

  BoolProperty,
  ByteProperty,
  EnumProperty,

  // integer types
  Int8Property,
  IntProperty,
  Int16Property,
  Int32Property,
  Int64Property,
  UInt64Property,
  UInt32Property,
  UInt16Property,

  // floating point types
  FloatProperty,
  DoubleProperty,

  // string types
  NameProperty,
  StrProperty,
  TextProperty,

  // delegate types
  DelegateProperty,
  MulticastDelegateProperty,

  // reference types
  ObjectProperty,
  InterfaceProperty,
  LazyObjectProperty,
  SoftObjectProperty,

  // containers
  ArrayProperty,
  StructProperty,
  MapProperty,
  SetProperty,

  // special types
  VectorProperty,
  RotatorProperty,
  OptionalProperty,
}

export const propertyById = new Map<EPropertyType, FName>([
  [EPropertyType.ByteProperty, FName.fromString("ByteProperty")],
  [EPropertyType.IntProperty, FName.fromString("IntProperty")],
  [EPropertyType.BoolProperty, FName.fromString("BoolProperty")],
  [EPropertyType.FloatProperty, FName.fromString("FloatProperty")],
  [EPropertyType.ObjectProperty, FName.fromString("ObjectProperty")],
  [EPropertyType.NameProperty, FName.fromString("NameProperty")],
  [EPropertyType.DelegateProperty, FName.fromString("DelegateProperty")],
  [EPropertyType.DoubleProperty, FName.fromString("DoubleProperty")],
  [EPropertyType.ArrayProperty, FName.fromString("ArrayProperty")],
  [EPropertyType.StructProperty, FName.fromString("StructProperty")],
  [EPropertyType.VectorProperty, FName.fromString("VectorProperty")],
  [EPropertyType.RotatorProperty, FName.fromString("RotatorProperty")],
  [EPropertyType.StrProperty, FName.fromString("StrProperty")],
  [EPropertyType.TextProperty, FName.fromString("TextProperty")],
  [EPropertyType.InterfaceProperty, FName.fromString("InterfaceProperty")],
  [EPropertyType.MulticastDelegateProperty, FName.fromString("MulticastDelegateProperty")],
  [EPropertyType.LazyObjectProperty, FName.fromString("LazyObjectProperty")],
  [EPropertyType.SoftObjectProperty, FName.fromString("SoftObjectProperty")],
  [EPropertyType.Int64Property, FName.fromString("Int64Property")],
  [EPropertyType.Int32Property, FName.fromString("Int32Property")],
  [EPropertyType.Int16Property, FName.fromString("Int16Property")],
  [EPropertyType.Int8Property, FName.fromString("Int8Property")],
  [EPropertyType.UInt64Property, FName.fromString("UInt64Property")],
  [EPropertyType.UInt32Property, FName.fromString("UInt32Property")],
  [EPropertyType.UInt16Property, FName.fromString("UInt16Property")],
  [EPropertyType.MapProperty, FName.fromString("MapProperty")],
  [EPropertyType.SetProperty, FName.fromString("SetProperty")],
  [EPropertyType.EnumProperty, FName.fromString("EnumProperty")],
  [EPropertyType.OptionalProperty, FName.fromString("OptionalProperty")],
]);

export const propertyByName = new Map<string, EPropertyType>(
  [...propertyById.entries()].map(([key, value]) => [value.text.toLowerCase(), key]),
);

// Also known as EClassSerializationControlExtension
export enum EPropertyTagExtension {
  NoExtension = 0x00,
  ReserveForFutureUse = 0x01,
  OverridableInformation = 0x02,
}

export enum EOverriddenPropertyOperation {
  /// no overridden operation was recorded on this property
  None,
  /// some sub property has recorded overridden operation
  Modified,
  /// everything has been overridden from this property down to every sub property/sub object
  Replace,
  /// this element was added in the container
  Add,
  /// this element was removed from the container
  Remove,
}

export enum EPropertyTagSerializeType {
  Unknown,
  Property,
  BinaryOrNative,
}

export enum EPropertyTagFlags {
  None = 0x00,
  HasArrayIndex = 0x01,
  HasPropertyGuid = 0x02,
  HasPropertyExtensions = 0x04,
  HasBinaryOrNativeSerialize = 0x08,
  BoolTrue = 0x10,
}

export function getTypeByName(name: FName) {
  return propertyByName.get(name.text.toLowerCase());
}
