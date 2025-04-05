import type { AssetReader } from "../AssetReader";
import type { ObjectResolver } from "../modules/CoreUObject/objects/Object";
import { EPropertyTagExtension, EPropertyType } from "../properties/enums";
import { FPropertyTag } from "../properties/PropertyTag";
import type { PropertyValue, SerializationError } from "../properties/TaggedProperty";
import { TaggedProperty } from "../properties/TaggedProperty";
import { EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";

import { getPropertySerializerFromTag, PropertyTooOldError, UnknownPropertyType } from "./property-serializer";

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
    if (tag.name.equals("StructSet")) {
      const t = 0;
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
    if (e instanceof PropertyTooOldError) {
      return makeError(e.message);
    }
    console.error(e);
    return makeError(`Cannot get serializer of '${typeName}': ${e}`);
  }

  try {
    const result = serializer(reader, resolver);

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

/**
 * Utility function to create an error value.
 */
function makeError(message: string): SerializationError {
  return {
    type: "error",
    message: message,
  };
}
