import type { AssetReader } from "../AssetReader";
import type { ObjectResolver } from "../objects/CoreUObject/Object";
import type { FPropertyTypeName } from "./PropertyTag";
import { FPropertyTag } from "./PropertyTag";
import type { NumericValue, PropertyValue } from "./properties";
import { FName, FNameMap } from "../structs/Name";
import { NAME_CoreUObject } from "../objects/names";
import { FGuid } from "../objects/CoreUObject/Guid";
import { FRotator } from "../objects/CoreUObject/Rotator";
import { FVector } from "../objects/CoreUObject/Vector";
import { typeTable } from "./type-table";
import { EPropertyType } from "./enums";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";
import invariant from "tiny-invariant";
import { FPlane } from "../objects/CoreUObject/Plane";
import { FQuat } from "../objects/CoreUObject/Quat";
import { readTaggedProperties } from "./properties-serialization";
import { FVector2D } from "../objects/CoreUObject/Vector2D";

export type PropertySerializer = (
  reader: AssetReader,
  resolver: ObjectResolver,
  typeName: FPropertyTypeName,
) => PropertyValue;

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
  console.log("Tag:", tag.toString());
  // Before UE 5.4 there was a special tag for array of structs.
  if (tag.legacyData) {
    if (tag.legacyData.type.equals(ArrayProperty) && tag.legacyData.innerType?.equals(StructProperty)) {
      if (reader.fileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_INNER_ARRAY_TAG_INFO) {
        // The file is too old, we can't ready anything without knowing the struct type.
        throw new UnknownPropertyType(tag.typeName);
      }
      const arraySize = reader.readInt32();
      const innerTag = FPropertyTag.fromStream(reader);
      return getLegacyStructArraySerializer(reader.fileVersionUE5, innerTag, arraySize);
    }
  }

  return getPropertySerializer(reader.fileVersionUE5, tag.typeName);
}

export function getPropertySerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  typeName: FPropertyTypeName,
): PropertySerializer {
  const propertyType = typeName.propertyType;

  if (propertyType == EPropertyType.ArrayProperty) {
    return getArraySerializer(typeName.getParameter(0), fileVersionUE5);
  }

  if (propertyType == EPropertyType.StructProperty) {
    return getStructSerializer(fileVersionUE5, typeName.getParameter(0));
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
  [makeCombinedName(NAME_CoreUObject, "Guid"), makeStructReader(FGuid.fromStream)],
  [makeCombinedName(NAME_CoreUObject, "Plane"), makeLargeWorld(FPlane.fromStream, FPlane.fromStreamDouble)],
  [makeCombinedName(NAME_CoreUObject, "Quat"), makeLargeWorld(FQuat.fromStream, FQuat.fromStreamDouble)],
  [makeCombinedName(NAME_CoreUObject, "Rotator"), makeLargeWorld(FRotator.fromStream, FRotator.fromStreamDouble)],
  [makeCombinedName(NAME_CoreUObject, "Vector"), makeLargeWorld(FVector.fromStream, FVector.fromStreamDouble)],
  [makeCombinedName(NAME_CoreUObject, "Vector2D"), makeLargeWorld(FVector2D.fromStream, FVector2D.fromStreamDouble)],
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

  // Find in our table of known types
  {
    const packageName = typeTable.get(structName);
    if (packageName) {
      const value = findNativeStructSerializer(fileVersionUE5, packageName, structName);
      if (value) {
        console.log(`Guess struct type: ${packageName}.${structName}`);
        return value;
      }
    }
  }

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

/**
 * Get the serializer for a legacy struct array.
 */
function getLegacyStructArraySerializer(
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  innerTag: FPropertyTag,
  arraySize: number,
): PropertySerializer {
  invariant(innerTag.legacyData);
  if (!innerTag.legacyData.type.equals(StructProperty)) {
    throw new Error("Expected array property");
  }

  const subTypeName = innerTag.typeName;
  const subSerializer = getPropertySerializer(fileVersionUE5, subTypeName);

  return (reader: AssetReader, resolver: ObjectResolver) => {
    const result: PropertyValue[] = [];
    for (let i = 0; i < arraySize; i++) {
      result.push(subSerializer(reader, resolver, subTypeName));
    }
    return { type: "array", value: result };
  };
}

function getArraySerializer(
  child: FPropertyTypeName,
  fileVersionUE5: EUnrealEngineObjectUE5Version,
  arraySize: number = -1,
): PropertySerializer {
  const subTypeName = child;
  const subSerializer = getPropertySerializer(fileVersionUE5, subTypeName);

  return (reader: AssetReader, resolver: ObjectResolver) => {
    const count = arraySize >= 0 ? arraySize : reader.readInt32();
    const result: PropertyValue[] = [];
    for (let i = 0; i < count; i++) {
      result.push(subSerializer(reader, resolver, subTypeName));
    }
    return { type: "array", value: result };
  };
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

  table[EPropertyType.ByteProperty] = (reader) => makeNumeric(reader.readUInt8());
  table[EPropertyType.EnumProperty] = (reader) => ({ type: "name", value: reader.readName() });

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

  table[EPropertyType.ObjectProperty] = (reader, resolver) => ({ type: "object", object: resolver(reader) });

  return table;
})();
