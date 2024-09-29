import { makeError, NumericValue, PropertyValue, TaggedProperty } from "./properties";
import { AssetReader } from "../AssetReader";
import { FPropertyTag, FPropertyTypeName } from "./PropertyTag";
import { EOverriddenPropertyOperation, EPropertyTagExtension, EPropertyType } from "./enums";
import { UStruct } from "../objects/CoreUObject/Class";
import { EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";
import { ObjectResolver } from "../objects/CoreUObject/Object";

export function readTaggedProperties(
  struct: UStruct,
  properties: TaggedProperty[],
  reader: AssetReader,
  isUClass: boolean,
  resolver: ObjectResolver,
) {
  // from UStruct::SerializeVersionedTaggedProperties

  properties.length = 0;

  let enableOverridableSerialization = false;
  let operation = EOverriddenPropertyOperation.None;

  if (
    isUClass &&
    reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.PROPERTY_TAG_EXTENSION_AND_OVERRIDABLE_SERIALIZATION
  ) {
    const serializationControl: EPropertyTagExtension = reader.readUInt8();
    if (serializationControl & EPropertyTagExtension.OverridableInformation) {
      operation = reader.readUInt8();
    }
  }

  while (true) {
    const tag = FPropertyTag.fromStream(reader);
    if (tag.name.isNone) {
      break;
    }

    properties.push(readTaggedProperty(tag, reader, resolver));
  }

  console.log(properties);
}

function readTaggedProperty(tag: FPropertyTag, reader: AssetReader, resolver: ObjectResolver) {
  let value: PropertyValue;

  // bool values are stored in the tag itself.
  // if the bool is in a container, it is stored normally.
  if (tag.typeName.propertyType == EPropertyType.BoolProperty) {
    if (tag.size > 0) {
      value = makeError(`Expected bool property stored in tag, but found extra bytes ${tag.size}.`);
    } else {
      value = { type: "boolean", value: tag.boolVal };
    }
  } else {
    value = readPropertyValue(tag.typeName, reader.subReader(tag.size), resolver);
  }

  return new TaggedProperty(tag, value);
}

function readPropertyValue(
  typeName: FPropertyTypeName,
  assetReader: AssetReader,
  resolver: ObjectResolver,
): PropertyValue {
  try {
    const row = readerTable[typeName.propertyType];
    if (!row) {
      return makeError(`Unknown property type: ${typeName}`);
    }
    let result = row(assetReader, resolver);

    // Check that the reader has read all the bytes.
    // Properties are easy to read, if there are extra bytes, it's likely a bug.
    if (result.type != "error" && assetReader.remaining > 0) {
      console.warn("Extra bytes found at the end of property value.");
      return makeError(`Found ${assetReader.remaining} bytes found at the end of property value (type: ${typeName}).`);
    }

    return result;
  } catch (e) {
    return makeError(`Cannot read property: ${e} (type: ${typeName})`);
  }
}

type ReaderRow = (reader: AssetReader, resolver: ObjectResolver) => PropertyValue;

function makeNumeric(value: number): NumericValue {
  return { type: "numeric", value: value };
}

function makeReaderTable() {
  const table: ReaderRow[] = [];

  table[EPropertyType.BoolProperty] = (reader: AssetReader) => {
    let number = reader.readInt8();
    if (number != 0 && number != 1) {
      console.warn("Boolean type should be 0 or 1, but got", number);
    }
    return { type: "boolean", value: number != 0 };
  };

  table[EPropertyType.ByteProperty] = (reader) => ({ type: "name", value: reader.readName() });
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
  table[EPropertyType.TextProperty] = (reader) => makeError("TextProperty not implemented");

  table[EPropertyType.ObjectProperty] = (reader, resolver) => ({ type: "object", object: resolver(reader) });

  return table;
}

const readerTable = makeReaderTable();
