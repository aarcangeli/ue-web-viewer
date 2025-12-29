import { EPropertyFlags } from "../../src/unreal-engine/properties/enums";

import type { ChildPropertyInfo, ClassRef, EnumInfo, EnumRef, PropertyInfo, StructRef } from "./LayoutDumpSchema";

export interface TypeResolver {
  resolveClassRef(classRef: ClassRef, asType: boolean): string;
  resolveStructRef(structRef: StructRef, asType: boolean): string;
  resolveEnumRef(enumRef: EnumRef, asType: boolean): string;
  getEnumInfo(enumRef: EnumRef): EnumInfo;

  /**
   * Resolve any global symbol, such as a constant or a class name.
   * @param name
   * @param asType
   */
  resolveSymbol(name: string, asType: boolean): string;
}

export function getPropertyType(property: ChildPropertyInfo, resolver: TypeResolver): string {
  switch (property.type) {
    case "ByteProperty":
      if (property.enumType) {
        return resolver.resolveEnumRef(property.enumType, true);
      }
      return "number";
    case "Int8Property":
    case "Int16Property":
    case "IntProperty":
    case "UInt32Property":
    case "UInt16Property":
    case "FloatProperty":
    case "DoubleProperty":
      return "number";
    case "Int64Property":
    case "UInt64Property":
      return "bigint";
    case "BoolProperty":
      return "boolean";
    case "ObjectProperty":
      return `${resolver.resolveClassRef(property.objectType, true)} | null`;
    case "SoftObjectProperty":
      return `${resolver.resolveSymbol("FSoftObjectPath", true)}`;
    case "WeakObjectProperty":
    case "LazyObjectProperty":
      break;
    case "ClassProperty":
    case "SoftClassProperty":
      return "Class";
    case "InterfaceProperty":
      break;
    case "NameProperty":
      return resolver.resolveSymbol("FName", true);
    case "StrProperty":
    case "Utf8StrProperty":
    case "AnsiStrProperty":
      return "string";
    case "ArrayProperty":
      return `Array<${getPropertyType(property.innerType, resolver)}>`;
    case "MapProperty":
      if (isNameMap(property)) {
        const nameMap = resolver.resolveSymbol("FNameMap", true);
        return `${nameMap}<${getPropertyType(property.valueType, resolver)}>`;
      }
      return `Map<${getPropertyType(property.keyType, resolver)}, ${getPropertyType(property.valueType, resolver)}>`;
    case "SetProperty":
      break;
    case "StructProperty":
      return resolver.resolveStructRef(property.structType, true);
    case "DelegateProperty":
      break;
    case "MulticastInlineDelegateProperty":
      break;
    case "MulticastSparseDelegateProperty":
      break;
    case "TextProperty":
      break;
    case "EnumProperty":
      return resolver.resolveEnumRef(property.enumType, true);
    case "FieldPathProperty":
      break;
    case "OptionalProperty":
      break;
  }
  console.error("ERROR: generateType not implemented for property type:", property.type);
  return `ERROR__${property.type}`;
}

export function getInitializer(property: ChildPropertyInfo, resolver: TypeResolver): string {
  switch (property.type) {
    case "ByteProperty":
      if (property.enumType) {
        return enumDefaultValue(property.enumType, resolver);
      }
      return "0";
    case "Int8Property":
    case "Int16Property":
    case "IntProperty":
    case "UInt32Property":
    case "UInt16Property":
    case "FloatProperty":
    case "DoubleProperty":
      return "0";
    case "Int64Property":
    case "UInt64Property":
      return "0n";
    case "BoolProperty":
      return "false";
    case "ObjectProperty":
      return "null";
    case "SoftObjectProperty":
      return `new ${resolver.resolveSymbol("FSoftObjectPath", false)}()`;
    case "WeakObjectProperty":
    case "LazyObjectProperty":
      break;
    case "ClassProperty":
    case "SoftClassProperty":
      return "Class";
    case "InterfaceProperty":
      break;
    case "NameProperty":
      return resolver.resolveSymbol("NAME_None", false);
    case "StrProperty":
    case "Utf8StrProperty":
    case "AnsiStrProperty":
      return '""';
    case "ArrayProperty":
      return "[]";
    case "MapProperty":
      if (isNameMap(property)) {
        const nameMap = resolver.resolveSymbol("FNameMap", false);
        return `new ${nameMap}()`;
      }
      return "new Map()";
    case "SetProperty":
      break;
    case "StructProperty":
      if (property.structType.struct == "Guid") {
        return resolver.resolveSymbol("GUID_None", false);
      }
      return `new ${resolver.resolveStructRef(property.structType, false)}()`;
    case "DelegateProperty":
      break;
    case "MulticastInlineDelegateProperty":
      break;
    case "MulticastSparseDelegateProperty":
      break;
    case "TextProperty":
      break;
    case "EnumProperty":
      return enumDefaultValue(property.enumType, resolver);
    case "FieldPathProperty":
      break;
    case "OptionalProperty":
      break;
  }
  console.error("ERROR: initializer not implemented for property type:", property.type);
  return `ERROR__${property.type}`;
}

function enumDefaultValue(enumType: EnumRef, resolver: TypeResolver) {
  const enumName = resolver.resolveEnumRef(enumType, false);

  const enumInfo = resolver.getEnumInfo(enumType);
  const defaultValue = enumInfo.values[0].name;

  return `${enumName}.${defaultValue}`;
}

export function getClassName(className: string): string {
  return `U${className}`;
}

export function getStructName(structName: string): string {
  return `F${structName}`;
}

export function shortPackageName(packageName: string): string {
  const parts = packageName.split("/");
  return parts[parts.length - 1];
}

export function getPropertiesToExport(properties: PropertyInfo[]): PropertyInfo[] {
  return properties.filter((prop) => {
    const flags = BigInt(prop.flagsLower) | (BigInt(prop.flagsUpper) << BigInt(32));
    const isTransient = (flags & BigInt(EPropertyFlags.Transient)) != BigInt(0);
    const skipSerialization = (flags & EPropertyFlags.SkipSerialization) != BigInt(0);
    return !isTransient && !skipSerialization;
  });
}

function isNameMap(property: ChildPropertyInfo) {
  return property.type == "MapProperty" && property.keyType.type == "NameProperty";
}
