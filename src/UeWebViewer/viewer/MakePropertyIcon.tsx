import React from "react";
import type { FPropertyTag, FPropertyTypeName } from "../../unreal-engine/properties/PropertyTag";
import { EPropertyType } from "../../unreal-engine/properties/enums";
import { Tooltip } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { MdQuestionMark } from "react-icons/md";
import { NAME_CoreUObject } from "../../unreal-engine/modules/names";
import { FName, FNameMap } from "../../unreal-engine/types/Name";

const colors = new Map<EPropertyType, string>([
  [EPropertyType.BoolProperty, "#950000"],
  [EPropertyType.ByteProperty, "#006F65"],

  [EPropertyType.IntProperty, "#1FE3AF"],
  [EPropertyType.Int8Property, "#1FE3AF"],
  [EPropertyType.Int16Property, "#1FE3AF"],
  [EPropertyType.Int32Property, "#1FE3AF"],
  [EPropertyType.Int64Property, "#ACE3AF"],
  [EPropertyType.UInt16Property, "#1FE3AF"],
  [EPropertyType.UInt32Property, "#1FE3AF"],
  [EPropertyType.UInt64Property, "#ACE3AF"],

  [EPropertyType.FloatProperty, "#38D500"],
  [EPropertyType.DoubleProperty, "#38D500"],

  [EPropertyType.NameProperty, "#CD82FF"],
  [EPropertyType.StrProperty, "#FF00D4"],
  [EPropertyType.TextProperty, "#E77CAA"],

  [EPropertyType.ObjectProperty, "#00AAF5"],
  [EPropertyType.InterfaceProperty, "#F1FFAA"],
  [EPropertyType.LazyObjectProperty, "#95FFFF"],
  [EPropertyType.SoftObjectProperty, "#95FFFF"],
]);
const COLOR_STRUCT = "#0059CB";
const COLOR_ENUM = "#006F65";

const structColors = new FNameMap<string>([[FName.fromString("Transform"), "#FF7300"]]);

/**
 * Create a colored icon for a property
 */
export function makePropertyIcon(tag: FPropertyTag): React.ReactElement {
  return (
    <Tooltip placement={"top"} label={tag.toString()}>
      {makeInner(tag)}
    </Tooltip>
  );
}

function getStructColor(parameter: FPropertyTypeName) {
  const structName = parameter.name;
  const packageName = parameter.getOptionalParameter(0);

  // If the package path is missing, we assume it's a struct from CoreUObject
  if (!packageName || packageName.name.equals(NAME_CoreUObject)) {
    const specificColor = structColors.get(structName);
    if (specificColor) {
      return specificColor;
    }
  }

  return COLOR_STRUCT;
}

function getColor(typeName: FPropertyTypeName) {
  const propertyType = typeName.propertyType;
  if (propertyType === EPropertyType.StructProperty) {
    const parameter = typeName.getOptionalParameter(0);
    if (parameter) {
      return getStructColor(parameter);
    }
  }
  if (propertyType === EPropertyType.EnumProperty) {
    return COLOR_ENUM;
  }
  return colors.get(propertyType) ?? "#ffffff";
}

function makeInner(tag: FPropertyTag) {
  try {
    const typeName = tag.typeName;
    switch (typeName.propertyType) {
      case EPropertyType.ArrayProperty:
        return makeArrayIcon(getColor(typeName.getParameter(0)));
      case EPropertyType.SetProperty:
        return makeSetColor(getColor(typeName.getParameter(0)));
      case EPropertyType.MapProperty:
        return makeMapColor(getColor(typeName.getParameter(0)), getColor(typeName.getParameter(1)));
      default:
        return makeSingularColor(getColor(typeName));
    }
  } catch (e) {
    console.error(e);
  }
  return (
    <span>
      <Icon as={MdQuestionMark} verticalAlign="middle" boxSize={5} />
    </span>
  );
}

function makeSingularColor(color: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="12" height="6" rx="2" fill={color} />
    </svg>
  );
}

function makeArrayIcon(color: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H4V4H0V0Z" fill={color} />
      <path d="M6 0H10V4H6V0Z" fill={color} />
      <path d="M12 0H16V4H12V0Z" fill={color} />
      <path d="M0 6H4V10H0V6Z" fill={color} />
      <path d="M6 6H10V10H6V6Z" fill={color} />
      <path d="M12 6H16V10H12V6Z" fill={color} />
      <path d="M0 12H4V16H0V12Z" fill={color} />
      <path d="M6 12H10V16H6V12Z" fill={color} />
      <path d="M12 12H16V16H12V12Z" fill={color} />
    </svg>
  );
}

function makeSetColor(color: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 7.99953C11.6688 7.70155 11.3735 7.36595 11.12 6.99955C10.947 6.79667 10.8146 6.56242 10.73 6.30955C10.6181 5.95638 10.5542 5.58976 10.54 5.21954C10.54 4.72435 10.5164 4.32739 10.4988 4.03112C10.4884 3.85473 10.48 3.71404 10.48 3.60955C10.4983 3.40004 10.4604 3.18944 10.37 2.99955C10.2624 2.71847 10.0759 2.47452 9.83278 2.29708C9.5897 2.11965 9.30048 2.01632 9 1.99955V0.999545H9.38C9.84979 0.983442 10.3198 1.02373 10.78 1.11955C11.1478 1.20587 11.4903 1.37711 11.78 1.61955C12.0164 1.84278 12.1802 2.13198 12.25 2.44955C12.3603 3.05294 12.4039 3.66662 12.38 4.27955C12.3706 4.6572 12.3907 5.03501 12.44 5.40954C12.4728 5.66728 12.5652 5.91382 12.71 6.12955C12.822 6.30653 12.9813 6.44858 13.17 6.53955C13.767 6.74067 14.3789 6.89448 15 6.99955V8.99951C14.3755 9.10406 13.7602 9.25787 13.16 9.45951C12.9713 9.55048 12.812 9.69252 12.7 9.86951C12.5552 10.0852 12.4628 10.3318 12.43 10.5895C12.3799 10.964 12.3599 11.3418 12.37 11.7195C12.3928 12.3324 12.3492 12.946 12.24 13.5495C12.1679 13.8662 12.0045 14.1548 11.77 14.3795C11.4778 14.6181 11.1362 14.7889 10.77 14.8795C10.3098 14.9753 9.83979 15.0156 9.37 14.9995H9V13.9995C9.2998 13.9803 9.58791 13.876 9.83056 13.6989C10.0732 13.5218 10.2603 13.2792 10.37 12.9995C10.456 12.8153 10.4939 12.6123 10.48 12.4095C10.48 12.1162 10.5 11.5762 10.54 10.7895C10.5542 10.4193 10.6181 10.0527 10.73 9.69951C10.8168 9.45067 10.9491 9.2201 11.12 9.01951C11.3698 8.64425 11.6654 8.30161 12 7.99953Z"
        fill={color}
      />
      <path
        d="M1 6.99956V8.99951C1.62113 9.10457 2.23302 9.25838 2.83 9.45951C3.01865 9.55048 3.17802 9.69252 3.29 9.86951C3.43478 10.0852 3.52723 10.3318 3.56 10.5895C3.61007 10.964 3.63014 11.3418 3.62 11.7195C3.59718 12.3324 3.64077 12.946 3.75 13.5495C3.8221 13.8662 3.98551 14.1548 4.22 14.3795C4.51224 14.6181 4.85378 14.7889 5.22 14.8795C5.68019 14.9753 6.15021 15.0156 6.62 14.9995H7V13.9995C6.70468 13.9837 6.41972 13.8854 6.17752 13.7157C5.93533 13.546 5.74563 13.3117 5.63 13.0395C5.54395 12.8553 5.5061 12.6523 5.52 12.4495C5.52 12.1628 5.5 11.6228 5.46 10.8295C5.44584 10.4593 5.38194 10.0927 5.27 9.73951C5.18319 9.49067 5.05095 9.2601 4.88 9.05951C4.63296 8.6702 4.33725 8.31399 4.00003 7.99954C4.33123 7.70155 4.62655 7.36596 4.88 6.99956C5.05527 6.79074 5.18779 6.5495 5.27 6.28956C5.38194 5.9364 5.44584 5.56977 5.46 5.19956C5.52 4.40956 5.52 3.86956 5.52 3.58956C5.5052 3.3867 5.5431 3.18346 5.63 2.99956C5.73757 2.71849 5.92414 2.47453 6.16722 2.2971C6.4103 2.11967 6.69952 2.01634 7 1.99956V0.999563H6.62C6.15275 0.990826 5.68612 1.03782 5.23 1.13956C4.86221 1.22589 4.51974 1.39713 4.23 1.63956C3.99359 1.86279 3.82982 2.152 3.76 2.46956C3.64974 3.07296 3.60615 3.68664 3.63 4.29956C3.63836 4.67055 3.6183 5.04164 3.57 5.40956C3.53723 5.6673 3.44478 5.91383 3.3 6.12956C3.18802 6.30655 3.02865 6.44859 2.84 6.53956C2.23976 6.7412 1.62451 6.89501 1 6.99956Z"
        fill={color}
      />
    </svg>
  );
}

function makeMapColor(keyColor: string, valueColor: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="4" height="4" fill={keyColor} />
      <rect y="6" width="4" height="4" fill={keyColor} />
      <rect y="12" width="4" height="4" fill={keyColor} />
      <rect x="6" width="10" height="4" fill={valueColor} />
      <rect x="6" y="6" width="10" height="4" fill={valueColor} />
      <rect x="6" y="12" width="10" height="4" fill={valueColor} />
    </svg>
  );
}
