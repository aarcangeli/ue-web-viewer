import type { PropertyValue } from "./properties";
import { makeError, TaggedProperty } from "./properties";
import type { AssetReader } from "../AssetReader";
import { FPropertyTag } from "./PropertyTag";
import { EPropertyTagExtension, EPropertyType } from "./enums";
import { EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";
import type { ObjectResolver } from "../modules/CoreUObject/objects/Object";
import { getPropertySerializerFromTag, UnknownPropertyType } from "./property-serializer";

export function readTaggedProperties(reader: AssetReader, isUClass: boolean, resolver: ObjectResolver) {
  // from UStruct::SerializeVersionedTaggedProperties

  const properties: TaggedProperty[] = [];

  if (
    isUClass &&
    reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.PROPERTY_TAG_EXTENSION_AND_OVERRIDABLE_SERIALIZATION
  ) {
    const serializationControl: EPropertyTagExtension = reader.readUInt8();
    if (serializationControl & EPropertyTagExtension.OverridableInformation) {
      // skip operation
      reader.readUInt8();
    }
  }

  for (;;) {
    const tag = FPropertyTag.fromStream(reader);
    if (tag.name.isNone) {
      break;
    }

    properties.push(readTaggedProperty(tag, reader, resolver));
  }

  return properties;
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
    value = readPropertyValue(tag, reader.subReader(tag.size), resolver);
  }

  return new TaggedProperty(tag, value);
}

function readPropertyValue(tag: FPropertyTag, reader: AssetReader, resolver: ObjectResolver): PropertyValue {
  const typeName = tag.typeName;

  let serializer;
  try {
    serializer = getPropertySerializerFromTag(reader, tag);
  } catch (e) {
    if (e instanceof UnknownPropertyType) {
      const message =
        typeName.toString() != e.typeName.toString()
          ? `Unknown property type '${e.typeName}' (FULL signature: '${typeName}')`
          : `Unknown property type '${typeName}'`;
      return makeError(message);
    }
    return makeError(`Cannot get serializer of '${typeName}': ${e}`);
  }

  try {
    const result = serializer(reader, resolver, typeName);

    // Check that the reader has read all the bytes.
    // Properties are easy to read, if there are extra bytes, it's likely a bug.
    if (result.type != "error" && reader.remaining > 0) {
      console.warn("Extra bytes found at the end of property value.");
      return makeError(`Found ${reader.remaining} bytes found at the end of property value (type: ${typeName}).`);
    }

    return result;
  } catch (e) {
    return makeError(`Cannot read property: ${e} (type: ${typeName})`);
  }
}
