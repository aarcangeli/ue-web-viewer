import { FName, NAME_None } from "../structs/Name";
import { EGuidFormats, FGuid } from "../objects/CoreUObject/Guid";
import type { AssetReader } from "../AssetReader";
import { EUnrealEngineObjectUE4Version, EUnrealEngineObjectUE5Version } from "../versioning/ue-versions";
import invariant from "tiny-invariant";
import {
  EOverriddenPropertyOperation,
  EPropertyTagExtension,
  EPropertyTagFlags,
  EPropertyTagSerializeType,
  EPropertyType,
  getTypeByName,
} from "./enums";

const StructProperty = FName.fromString("StructProperty");
const BoolProperty = FName.fromString("BoolProperty");
const ByteProperty = FName.fromString("ByteProperty");
const EnumProperty = FName.fromString("EnumProperty");
const ArrayProperty = FName.fromString("ArrayProperty");
const OptionalProperty = FName.fromString("OptionalProperty");
const SetProperty = FName.fromString("SetProperty");
const MapProperty = FName.fromString("MapProperty");

export class FPropertyTag {
  name: FName = NAME_None;
  typeName: FPropertyTypeName = new FPropertyTypeName(NAME_None, []);

  size: number = 0;
  arrayIndex: number = 0;
  boolVal: boolean = false;
  propertyGuid: FGuid | null = null;

  /// Legacy data (before UE 5.4)
  legacyData: FLegacyPropertyTag | null = null;

  // extension
  serializeType: EPropertyTagSerializeType = EPropertyTagSerializeType.Unknown;
  overrideOperation: EOverriddenPropertyOperation = EOverriddenPropertyOperation.None;
  experimentalOverridableLogic: boolean = false;

  toString() {
    return `PropertyTag '${this.name}' (${this.typeName})`;
  }

  get text(): string {
    return this.toString();
  }

  static fromStream(reader: AssetReader): FPropertyTag {
    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.PROPERTY_TAG_COMPLETE_TYPE_NAME) {
      return this.fromNewFormat(reader);
    } else {
      return this.fromLegacyStream(reader);
    }
  }

  private static fromLegacyStream(reader: AssetReader): FPropertyTag {
    // utility which converts a legacy name to the new format
    const parseLegacyEnumName = (name: string) => {
      const lastDot = Math.max(name.lastIndexOf("."), name.lastIndexOf(":"));
      if (lastDot >= 0) {
        const outerChain = name.substring(0, lastDot);
        const objectName = name.substring(lastDot + 1);

        const innerTypes: FPropertyTypeName[] = [];
        for (const part of outerChain.split(/[.:]/)) {
          innerTypes.push(FPropertyTypeName.fromString(part));
        }

        return new FPropertyTypeName(FName.fromString(objectName), innerTypes);
      } else {
        return FPropertyTypeName.fromString(name);
      }
    };

    const result = new FPropertyTag();
    result.name = reader.readName();
    if (result.name.isNone) {
      return result;
    }

    const type = reader.readName();
    result.size = reader.readInt32();
    result.arrayIndex = reader.readInt32();

    // Legacy optional parameters, and convert to FPropertyTypeName
    const legacyTag = new FLegacyPropertyTag();
    legacyTag.type = type;
    let typeName = new FPropertyTypeName(type);
    if (type.equals(StructProperty)) {
      legacyTag.structName = reader.readName();
      typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.structName));
      if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_STRUCT_GUID_IN_PROPERTY_TAG) {
        legacyTag.structGuid = FGuid.fromStream(reader);
        if (legacyTag.structGuid.isValid()) {
          typeName = typeName.addInnerType(FPropertyTypeName.fromGuid(legacyTag.structGuid));
        }
      }
    } else if (type.equals(BoolProperty)) {
      result.boolVal = reader.readUInt8() !== 0;
    } else if (type.equals(ByteProperty)) {
      legacyTag.enumName = reader.readName();
      typeName = typeName.addInnerType(parseLegacyEnumName(legacyTag.enumName.text));
    } else if (type.equals(EnumProperty)) {
      legacyTag.enumName = reader.readName();
      typeName = typeName.addInnerType(parseLegacyEnumName(legacyTag.enumName.text));
      typeName = typeName.addInnerType(FPropertyTypeName.fromName(ByteProperty));
    } else if (type.equals(ArrayProperty)) {
      if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VAR_UE4_ARRAY_PROPERTY_INNER_TAGS) {
        legacyTag.innerType = reader.readName();
        typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.innerType));
      }
    } else if (type.equals(OptionalProperty)) {
      legacyTag.innerType = reader.readName();
      typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.innerType));
    } else if (type.equals(SetProperty)) {
      if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PROPERTY_TAG_SET_MAP_SUPPORT) {
        legacyTag.innerType = reader.readName();
        typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.innerType));
      }
    } else if (type.equals(MapProperty)) {
      if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PROPERTY_TAG_SET_MAP_SUPPORT) {
        legacyTag.innerType = reader.readName();
        legacyTag.valueType = reader.readName();
        typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.innerType));
        typeName = typeName.addInnerType(FPropertyTypeName.fromName(legacyTag.valueType));
      }
    }
    result.legacyData = legacyTag;
    result.typeName = typeName;

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_PROPERTY_GUID_IN_PROPERTY_TAG) {
      const hasPropertyGuid = reader.readUInt8() !== 0;
      if (hasPropertyGuid) {
        result.propertyGuid = FGuid.fromStream(reader);
      }
    }

    if (reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.PROPERTY_TAG_EXTENSION_AND_OVERRIDABLE_SERIALIZATION) {
      result.readPropertyExtensions(reader);
    }

    result.serializeType = EPropertyTagSerializeType.Property;

    return result;
  }

  private static fromNewFormat(reader: AssetReader) {
    invariant(reader.fileVersionUE5 >= EUnrealEngineObjectUE5Version.PROPERTY_TAG_COMPLETE_TYPE_NAME);

    const result = new FPropertyTag();

    result.name = reader.readName();

    if (result.name.isNone) {
      return result;
    }

    result.typeName = FPropertyTypeName.fromStream(reader);
    result.size = reader.readInt32();

    const flags = reader.readUInt8();
    result.arrayIndex = flags & EPropertyTagFlags.HasArrayIndex ? reader.readInt32() : 0;
    result.propertyGuid = flags & EPropertyTagFlags.HasPropertyGuid ? FGuid.fromStream(reader) : null;

    if (flags & EPropertyTagFlags.HasPropertyExtensions) {
      result.readPropertyExtensions(reader);
    }

    result.serializeType =
      flags & EPropertyTagFlags.HasBinaryOrNativeSerialize
        ? EPropertyTagSerializeType.BinaryOrNative
        : EPropertyTagSerializeType.Property;

    result.boolVal = (flags & EPropertyTagFlags.BoolTrue) !== 0;

    return result;
  }

  private readPropertyExtensions(reader: AssetReader) {
    const propertyExtensions = reader.readUInt8();

    if (propertyExtensions & EPropertyTagExtension.OverridableInformation) {
      this.overrideOperation = reader.readUInt8();
      this.experimentalOverridableLogic = reader.readBoolean();
    }
  }
}

/**
 * This struct contains fields of FPropertyTag  deprecated in UE 5.4
 * Supported combinations:
 * - StructProperty(structName, structGuid)
 * - BoolProperty(boolVal)
 * - ByteProperty(enumName)
 * - EnumProperty(enumName)
 * - ArrayProperty(innerType)
 * - OptionalProperty(innerType)
 * - SetProperty(innerType)
 * - MapProperty(innerType, valueType)
 */
class FLegacyPropertyTag {
  type: FName = NAME_None;
  structName: FName | null = null;
  structGuid: FGuid | null = null;
  enumName: FName | null = null;
  innerType: FName | null = null;
  valueType: FName | null = null;
}

/**
 * This struct is introduced in UE 5.4 and contains a hierarchy of property types.
 * Sometimes, the nodes may be missing for incomplete information.
 * Known types are:
 * - StructProperty(structName(outer1,outer2,...), structGuid)
 * - EnumProperty(enumName(outer1,outer2,...), ByteProperty)
 * - ArrayProperty(innerType)
 * - OptionalProperty(innerType)
 * - SetProperty(innerType)
 * - MapProperty(innerType, valueType)
 */
export class FPropertyTypeName {
  readonly name: FName;
  readonly innerTypes: ReadonlyArray<FPropertyTypeName>;

  constructor(name: FName, innerTypes: ReadonlyArray<FPropertyTypeName> = []) {
    this.name = name;
    this.innerTypes = innerTypes;
  }

  static fromStream(reader: AssetReader): FPropertyTypeName {
    const name = reader.readName();
    const innerCount = reader.readInt32();

    const innerTypes: FPropertyTypeName[] = [];
    for (let i = 0; i < innerCount; ++i) {
      innerTypes.push(this.fromStream(reader));
    }

    return new FPropertyTypeName(name, innerTypes);
  }

  static fromName(name: FName): FPropertyTypeName {
    return new FPropertyTypeName(name);
  }

  static fromGuid(gui: FGuid) {
    // This behavior is from FPropertyTypeNameBuilder::AddGuid
    return new FPropertyTypeName(FName.fromString(gui.toString(EGuidFormats.DigitsWithHyphensLower)));
  }

  static fromString(name: string): FPropertyTypeName {
    return new FPropertyTypeName(FName.fromString(name));
  }

  get propertyType(): EPropertyType {
    return getTypeByName(this.name) ?? EPropertyType.Unknown;
  }

  addInnerType(innerType: FPropertyTypeName) {
    return new FPropertyTypeName(this.name, [...this.innerTypes, innerType]);
  }

  toString(): string {
    return this.name.text + (this.innerTypes.length ? `(${this.innerTypes.map((x) => x.toString()).join(",")})` : "");
  }

  get text(): string {
    return this.toString();
  }

  getParameter(index: number) {
    if (index >= this.innerTypes.length) {
      throw new Error(`Expected inner type at index ${index}, but found only ${this.innerTypes.length} values.`);
    }
    return this.innerTypes[index];
  }
}
