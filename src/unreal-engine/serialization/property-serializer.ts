import type { AssetReader } from "../AssetReader";
import type { ObjectResolver } from "../modules/CoreUObject/objects/Object";
import type { FPropertyTypeName } from "../properties/PropertyTag";
import { FPropertyTag } from "../properties/PropertyTag";
import type { MapValue, NumericValue, PropertyValue, SetValue } from "../properties/TaggedProperty";
import { FName, FNameMap } from "../types/Name";
import { NAME_CoreUObject } from "../modules/names";
import { FGuid } from "../modules/CoreUObject/structs/Guid";
import { FRotator } from "../modules/CoreUObject/structs/Rotator";
import { FVector3 } from "../modules/CoreUObject/structs/Vector3";
import { EPropertyType } from "../properties/enums";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";
import invariant from "tiny-invariant";
import { FPlane } from "../modules/CoreUObject/structs/Plane";
import { FQuat } from "../modules/CoreUObject/structs/Quat";
import { readTaggedProperties } from "./properties-serialization";
import { FVector2 } from "../modules/CoreUObject/structs/Vector2";
import { FVector4 } from "../modules/CoreUObject/structs/Vector4";
import { FBox } from "../modules/CoreUObject/structs/Box";
import { FMatrix44 } from "../modules/CoreUObject/structs/Matrix44";
import { FLinearColor } from "../modules/CoreUObject/structs/LinearColor";
import { FColor } from "../modules/CoreUObject/structs/Color";
import { FTwoVectors } from "../modules/CoreUObject/structs/TwoVectors";
import { FTransform } from "../modules/CoreUObject/structs/Transform";
import { FDateTime } from "../modules/CoreUObject/structs/DateTime";
import { FTimespan } from "../modules/CoreUObject/structs/Timespan";
import { FFrameNumber } from "../modules/CoreUObject/structs/FrameNumber";
import { FSoftObjectPath } from "../modules/CoreUObject/structs/SoftObjectPath";
import { FText } from "../types/Text";

type PropertySerializer = (reader: AssetReader, resolver: ObjectResolver) => PropertyValue;

const StructProperty = FName.fromString("StructProperty");
const ArrayProperty = FName.fromString("ArrayProperty");

/**
 * A serializer for a struct property.
 * The value is an array in case the serialization depends on the floating point precision.
 */
type StructPropertySerializer = PropertySerializer | [PropertySerializer, PropertySerializer];

export class UnknownPropertyType extends Error {
  constructor(public typeName: FPropertyTypeName) {
    super(`Unknown property type: ${typeName}`);
  }
}

/**
 * Retrieve the correct serializer for a property type.
 * We might need to read additional data from the reader in older versions.
 *
 * @param tag The property tag.
 * @param reader The asset reader, we might need to read additional data.
 * @throws {UnknownPropertyType} If the property type is unknown.
 */
export function getPropertySerializerFromTag(reader: AssetReader, tag: FPropertyTag): PropertySerializer {
  // Old property migrations are handled here.
  if (reader.fileVersionUE5 < EUnrealEngineObjectUE5Version.PROPERTY_TAG_COMPLETE_TYPE_NAME) {
    const legacySerializer = convertFromLegacyTagIfNeeded(reader, tag);
    if (legacySerializer) {
      return legacySerializer;
    }
  }

  return getPropertySerializer(reader.fileVersionUE5, tag.typeName);
}

/**
 * Retrieve the correct serializer for a property type.
 * @param fileVersionUE5
 * @param typeName
 */
export function getPropertySerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  typeName: FPropertyTypeName,
): PropertySerializer {
  const propertyType = typeName.propertyType;

  if (propertyType == EPropertyType.StructProperty) {
    return getStructSerializer(fileVersionUE5, typeName.getParameter(0));
  }

  if (propertyType == EPropertyType.ArrayProperty) {
    return getArraySerializer(typeName.getParameter(0), fileVersionUE5);
  }

  if (propertyType == EPropertyType.SetProperty) {
    return getSetSerializer(typeName.getParameter(0), fileVersionUE5);
  }

  if (propertyType == EPropertyType.MapProperty) {
    return getMapSerializer(typeName.getParameter(0), typeName.getParameter(1), fileVersionUE5);
  }

  if (propertyType == EPropertyType.SoftObjectProperty) {
    return softObjectPathSerializer;
  }

  if (propertyType == EPropertyType.ByteProperty) {
    return getBytePropertyReader(fileVersionUE5, typeName);
  }

  const foundValue = readerByPropertyType[propertyType];
  if (foundValue) {
    return foundValue;
  }

  throw new UnknownPropertyType(typeName);
}

function makeCombinedName(packageName: FName | string, objectName: FName | string): FName {
  return FName.fromString(`${packageName}.${objectName}`);
}

function makeStructReader<T extends object>(generator: (reader: AssetReader) => T): PropertySerializer {
  return (reader) => ({ type: "native-struct", value: generator(reader) });
}

function softObjectPathSerializer(reader: AssetReader, resolver: ObjectResolver): PropertyValue {
  const object = resolver(reader);
  const objectPath = object ? FSoftObjectPath.fromObject(object) : FSoftObjectPath.empty();
  return { type: "native-struct", value: objectPath };
}

function makeLargeWorld<T extends object>(
  generatorFloat: (reader: AssetReader) => T,
  generatorDouble: (reader: AssetReader) => T,
): StructPropertySerializer {
  return [makeStructReader(generatorFloat), makeStructReader(generatorDouble)];
}

/**
 * This is a list of structs with native serialization support.
 *
 * A C++ struct is native serializable if:
 * - Has the "bool Serialize(FArchive& Ar)" or "bool Serialize(FStructuredArchive::FSlot Slot)" method.
 * - Has a trait "TStructOpsTypeTraits<StructType>::WithSerializer" or "TStructOpsTypeTraits<StructType>::WithStructuredSerializer".
 */
const readerByStructName = new FNameMap<StructPropertySerializer>([
  // Vector2
  [makeCombinedName(NAME_CoreUObject, "Vector2f"), makeStructReader(FVector2.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Vector2d"), makeLargeWorld(FVector2.fromFloat, FVector2.fromDouble)],

  // Vector3
  [makeCombinedName(NAME_CoreUObject, "Vector3f"), makeStructReader(FVector3.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Vector3d"), makeLargeWorld(FVector3.fromFloat, FVector3.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Vector"), makeLargeWorld(FVector3.fromFloat, FVector3.fromDouble)],

  // IntPoint / UintPoint
  [makeCombinedName(NAME_CoreUObject, "Int32Point"), makeStructReader(FVector2.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "Int64Point"), makeStructReader(FVector2.fromInt64)],
  [makeCombinedName(NAME_CoreUObject, "Uint32Point"), makeStructReader(FVector2.fromUInt32)],
  [makeCombinedName(NAME_CoreUObject, "Uint64Point"), makeStructReader(FVector2.fromUInt64)],
  [makeCombinedName(NAME_CoreUObject, "IntPoint"), makeStructReader(FVector2.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "UintPoint"), makeStructReader(FVector2.fromUInt32)],

  // IntVector2 / UintVector2
  [makeCombinedName(NAME_CoreUObject, "Int32Vector2"), makeStructReader(FVector2.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "Int64Vector2"), makeStructReader(FVector2.fromInt64)],
  [makeCombinedName(NAME_CoreUObject, "Uint32Vector2"), makeStructReader(FVector2.fromUInt32)],
  [makeCombinedName(NAME_CoreUObject, "Uint64Vector2"), makeStructReader(FVector2.fromUInt64)],
  [makeCombinedName(NAME_CoreUObject, "IntVector2"), makeStructReader(FVector2.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "UintVector2"), makeStructReader(FVector2.fromUInt32)],

  // IntVector / UintVector
  [makeCombinedName(NAME_CoreUObject, "Int32Vector"), makeStructReader(FVector3.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "Int64Vector"), makeStructReader(FVector3.fromInt64)],
  [makeCombinedName(NAME_CoreUObject, "Uint32Vector"), makeStructReader(FVector3.fromUint32)],
  [makeCombinedName(NAME_CoreUObject, "Uint64Vector"), makeStructReader(FVector3.fromUint64)],
  [makeCombinedName(NAME_CoreUObject, "IntVector"), makeStructReader(FVector3.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "UintVector"), makeStructReader(FVector3.fromUint32)],

  // IntVector4 / UintVector4
  [makeCombinedName(NAME_CoreUObject, "Int32Vector4"), makeStructReader(FVector4.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "Int64Vector4"), makeStructReader(FVector4.fromInt64)],
  [makeCombinedName(NAME_CoreUObject, "Uint32Vector4"), makeStructReader(FVector4.fromUInt32)],
  [makeCombinedName(NAME_CoreUObject, "Uint64Vector4"), makeStructReader(FVector4.fromUInt64)],
  [makeCombinedName(NAME_CoreUObject, "IntVector4"), makeStructReader(FVector4.fromInt32)],
  [makeCombinedName(NAME_CoreUObject, "UintVector4"), makeStructReader(FVector4.fromUInt32)],

  // Vector4
  [makeCombinedName(NAME_CoreUObject, "Vector4f"), makeStructReader(FVector4.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Vector4d"), makeLargeWorld(FVector4.fromFloat, FVector4.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Vector4"), makeLargeWorld(FVector4.fromFloat, FVector4.fromDouble)],

  // Plane4
  [makeCombinedName(NAME_CoreUObject, "Plane4f"), makeStructReader(FPlane.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Plane4d"), makeLargeWorld(FPlane.fromFloat, FPlane.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Plane"), makeLargeWorld(FPlane.fromFloat, FPlane.fromDouble)],

  // Rotator
  [makeCombinedName(NAME_CoreUObject, "Rotator3f"), makeStructReader(FRotator.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Rotator3d"), makeLargeWorld(FRotator.fromFloat, FRotator.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Rotator"), makeLargeWorld(FRotator.fromFloat, FRotator.fromDouble)],

  // FBox
  [makeCombinedName(NAME_CoreUObject, "Box3f"), makeStructReader(FBox.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Box3d"), makeLargeWorld(FBox.fromFloat, FBox.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Box"), makeLargeWorld(FBox.fromFloat, FBox.fromDouble)],

  // Matrix44
  [makeCombinedName(NAME_CoreUObject, "Matrix44f"), makeStructReader(FMatrix44.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Matrix44d"), makeLargeWorld(FMatrix44.fromFloat, FMatrix44.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Matrix"), makeLargeWorld(FMatrix44.fromFloat, FMatrix44.fromDouble)],

  // Colors
  [makeCombinedName(NAME_CoreUObject, "LinearColor"), makeStructReader(FLinearColor.fromStream)],
  [makeCombinedName(NAME_CoreUObject, "Color"), makeStructReader(FColor.fromStream)],

  // Quat
  [makeCombinedName(NAME_CoreUObject, "Quat4f"), makeStructReader(FQuat.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Quat4d"), makeLargeWorld(FQuat.fromFloat, FQuat.fromDouble)],
  [makeCombinedName(NAME_CoreUObject, "Quat"), makeLargeWorld(FQuat.fromFloat, FQuat.fromDouble)],

  // TwoVectors
  [makeCombinedName(NAME_CoreUObject, "TwoVectors"), makeLargeWorld(FTwoVectors.fromFloat, FTwoVectors.fromDouble)],

  // Transform
  [makeCombinedName(NAME_CoreUObject, "Transform3f"), makeStructReader(FTransform.fromFloat)],
  [makeCombinedName(NAME_CoreUObject, "Transform3d"), makeStructReader(FTransform.fromDouble)],
  // FTransform uses tagged properties for serialization
  // [makeCombinedName(NAME_CoreUObject, "Transform"), makeLargeWorld(FTransform.fromFloat, FTransform.fromDouble)],

  // Guid
  [makeCombinedName(NAME_CoreUObject, "Guid"), makeStructReader(FGuid.fromStream)],

  // Date and time
  [makeCombinedName(NAME_CoreUObject, "DateTime"), makeStructReader(FDateTime.fromStream)],
  [makeCombinedName(NAME_CoreUObject, "Timespan"), makeStructReader(FTimespan.fromStream)],
  [makeCombinedName(NAME_CoreUObject, "FrameNumber"), makeStructReader(FFrameNumber.fromStream)],

  // Soft class reference
  [makeCombinedName(NAME_CoreUObject, "SoftObjectPath"), softObjectPathSerializer],
  [makeCombinedName(NAME_CoreUObject, "SoftClassPath"), softObjectPathSerializer],
]);

/**
 * Before UE 5.4 there was a simplified tag format which doesn't contain the hierarchy of property types.
 * We try our best to find the correct struct reader based on the name.
 */
function findFallbackSerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  typeName: FPropertyTypeName,
): PropertySerializer {
  const structName = typeName.name;

  // Find the first known package that contains this type
  let packageName;
  let foundValue;
  const nameToFind = `.${structName.text}`.toLowerCase();
  readerByStructName.forEach((value, key) => {
    if (key.text.toLowerCase().endsWith(nameToFind)) {
      packageName = key;
      foundValue = value;
    }
  });
  if (foundValue) {
    console.log(`Guess struct type: ${packageName}.${structName}`);
    const serializer = convertSerializer(fileVersionUE5, foundValue);
    if (serializer) {
      return serializer;
    }
  }

  // We hope the struct is a tagged struct.
  return taggedPropertiesSerializer;
}

function convertSerializer(fileVersionUE5: EUnrealEngineObjectUE5Version, newVar: StructPropertySerializer) {
  if (Array.isArray(newVar)) {
    const isLargeWorld = fileVersionUE5 >= EUnrealEngineObjectUE5Version.LARGE_WORLD_COORDINATES;
    return newVar[isLargeWorld ? 1 : 0];
  }
  return newVar;
}

function findNativeStructSerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  packageName: FName,
  structName: FName,
): PropertySerializer | undefined {
  const newVar = readerByStructName.get(makeCombinedName(packageName, structName));
  if (newVar) {
    return convertSerializer(fileVersionUE5, newVar);
  }
}

function taggedPropertiesSerializer(reader: AssetReader, resolver: ObjectResolver): PropertyValue {
  const properties = readTaggedProperties(reader, false, resolver);
  return { type: "struct", value: properties };
}

function getStructSerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  structName: FPropertyTypeName,
): PropertySerializer {
  // Before UE 5.4, the package name was not stored in the tag.
  // We have to guess based on the struct name (which may potentially be wrong).
  if (!structName.innerTypes.length) {
    return findFallbackSerializer(fileVersionUE5, structName);
  }

  const outer = structName.getParameter(0);
  const newVar = findNativeStructSerializer(fileVersionUE5, outer.name, structName.name);
  if (newVar) {
    return newVar;
  }

  // We assume the struct is serialized using property tags.
  return taggedPropertiesSerializer;
}

function getArraySerializer(
  subTypeName: FPropertyTypeName,
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  arraySize: number = -1,
): PropertySerializer {
  const subSerializer = getPropertySerializer(fileVersionUE5, subTypeName);

  return (reader: AssetReader, resolver: ObjectResolver) => {
    const count = arraySize >= 0 ? arraySize : reader.readInt32();
    const result: PropertyValue[] = [];
    for (let i = 0; i < count; i++) {
      result.push(subSerializer(reader, resolver));
    }
    return { type: "array", value: result };
  };
}

function getSetSerializer(
  subTypename: FPropertyTypeName,
  fileVersionUE5: EUnrealEngineObjectUE5Version,
): PropertySerializer {
  const subSerializer = getPropertySerializer(fileVersionUE5, subTypename);

  return (reader: AssetReader, resolver: ObjectResolver): SetValue => {
    // Read elements to remove
    const countToRemove = reader.readInt32();
    const elementsToRemove: PropertyValue[] = [];
    for (let i = 0; i < countToRemove; i++) {
      elementsToRemove.push(subSerializer(reader, resolver));
    }

    // Read elements to add
    const count = reader.readInt32();
    const value: PropertyValue[] = [];
    for (let i = 0; i < count; i++) {
      value.push(subSerializer(reader, resolver));
    }

    return { type: "set", elementsToRemove, value };
  };
}

function getMapSerializer(
  keyTypename: FPropertyTypeName,
  valueTypename: FPropertyTypeName,
  fileVersionUE5: EUnrealEngineObjectUE5Version,
): PropertySerializer {
  const keySerializer = getPropertySerializer(fileVersionUE5, keyTypename);
  const valueSerializer = getPropertySerializer(fileVersionUE5, valueTypename);

  return (reader: AssetReader, resolver: ObjectResolver): MapValue => {
    // Read elements to remove
    const countToRemove = reader.readInt32();
    const elementsToRemove: PropertyValue[] = [];
    for (let i = 0; i < countToRemove; i++) {
      elementsToRemove.push(keySerializer(reader, resolver));
    }

    // Read elements to add
    const count = reader.readInt32();
    const result: Array<[PropertyValue, PropertyValue]> = [];
    for (let i = 0; i < count; i++) {
      const key = keySerializer(reader, resolver);
      const value = valueSerializer(reader, resolver);
      result.push([key, value]);
    }

    return { type: "map", elementsToRemove, value: result };
  };
}

function bytePropertyReader(reader: AssetReader): PropertyValue {
  return { type: "numeric", value: reader.readUInt8() };
}

function enumPropertyReader(reader: AssetReader): PropertyValue {
  const enumValue = reader.readName();
  return { type: "name", value: enumValue };
}

function getBytePropertyReader(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  typeName: FPropertyTypeName,
): PropertySerializer {
  // ByteProperty may be an enum value (FName) or a byte value (uint8).
  // This depends on the actual type at the moment of serialization.

  // Before UE 5.4 we cannot be sure if the type is a byte or an enum.
  // This is because FPropertyTag doesn't contain the full type name.
  if (fileVersionUE5 < EUnrealEngineObjectUE5Version.PROPERTY_TAG_COMPLETE_TYPE_NAME) {
    if (!typeName.getOptionalParameter(0)) {
      console.warn("ByteProperty without type name, assuming byte");
      return bytePropertyReader;
    }
  }

  // If the enum type is present, the serializer has written the enum value as a name.
  // (see FByteProperty::ConvertFromType case NAME_ByteProperty)
  const enumType = typeName.getOptionalParameter(0);
  if (enumType) {
    invariant(!enumType.name.isNone);
    return enumPropertyReader;
  }

  // With 5.4 we are sure 100% that the type is a byte.
  return bytePropertyReader;
}

const readerByPropertyType = (() => {
  const makeNumeric = (value: number): NumericValue => ({ type: "numeric", value: value });

  const table: PropertySerializer[] = [];

  table[EPropertyType.BoolProperty] = (reader: AssetReader) => {
    const number = reader.readInt8();
    if (number != 0 && number != 1) {
      console.warn("Boolean type should be 0 or 1, but got", number);
    }
    return { type: "boolean", value: number != 0 };
  };

  table[EPropertyType.EnumProperty] = enumPropertyReader;

  table[EPropertyType.Int8Property] = (reader) => makeNumeric(reader.readInt8());
  table[EPropertyType.Int16Property] = (reader) => makeNumeric(reader.readInt16());
  table[EPropertyType.Int32Property] = (reader) => makeNumeric(reader.readInt32());
  table[EPropertyType.IntProperty] = (reader) => makeNumeric(reader.readInt32());
  table[EPropertyType.Int64Property] = (reader) => makeNumeric(reader.readInt64());

  table[EPropertyType.UInt16Property] = (reader) => makeNumeric(reader.readUInt16());
  table[EPropertyType.UInt32Property] = (reader) => makeNumeric(reader.readUInt32());
  table[EPropertyType.UInt64Property] = (reader) => makeNumeric(reader.readUInt64());

  table[EPropertyType.FloatProperty] = (reader) => makeNumeric(reader.readFloat());
  table[EPropertyType.DoubleProperty] = (reader) => makeNumeric(reader.readDouble());

  table[EPropertyType.NameProperty] = (reader) => ({ type: "name", value: reader.readName() });
  table[EPropertyType.StrProperty] = (reader) => ({ type: "string", value: reader.readString() });
  table[EPropertyType.TextProperty] = (reader) => ({ type: "text", value: FText.fromStream(reader) });

  table[EPropertyType.ObjectProperty] = (reader, resolver) => ({ type: "object", object: resolver(reader) });

  return table;
})();

// region Legacy Serialization (pre UE 5.4)

/**
 * Some types may have a different serialization format in older versions (pre UE 5.4).
 * @throws {UnknownPropertyType} If the property cannot be read safely.
 */
function convertFromLegacyTagIfNeeded(reader: AssetReader, tag: FPropertyTag): PropertySerializer | null {
  invariant(tag.legacyData);
  invariant(reader.fileVersionUE5 < EUnrealEngineObjectUE5Version.PROPERTY_TAG_COMPLETE_TYPE_NAME);

  // Before UE 5.4 there was a special tag for array of structs.
  if (tag.legacyData.type.equals(ArrayProperty) && tag.legacyData.innerType?.equals(StructProperty)) {
    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_INNER_ARRAY_TAG_INFO) {
      return getLegacyStructArraySerializer(reader);
    }
    // The file is too old, we can't ready anything without knowing the struct type.
    throw new UnknownPropertyType(tag.typeName);
  }

  return null;
}

/**
 * Get the serializer for a legacy struct array.
 * Es: TArray<FSomeStruct> in UE 4.25
 */
function getLegacyStructArraySerializer(reader: AssetReader): PropertySerializer {
  const fileVersionUE5 = reader.fileVersionUE5;

  // Read the array size and the inner struct type.
  const arraySize = reader.readInt32();
  const innerTag = FPropertyTag.fromStream(reader);

  invariant(innerTag.legacyData);
  if (!innerTag.legacyData.type.equals(StructProperty)) {
    throw new Error("Expected array property");
  }

  const subSerializer = getPropertySerializer(fileVersionUE5, innerTag.typeName);

  return (reader: AssetReader, resolver: ObjectResolver) => {
    const result: PropertyValue[] = [];
    for (let i = 0; i < arraySize; i++) {
      result.push(subSerializer(reader, resolver));
    }
    return { type: "array", value: result };
  };
}

// endregion
