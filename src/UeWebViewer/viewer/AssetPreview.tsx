import type { AssetApi } from "../../unreal-engine/serialization/Asset";
import type { ReactNode } from "react";
import React from "react";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, IconButton, Tooltip } from "@chakra-ui/react";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import type { PropertyValue } from "../../unreal-engine/properties/TaggedProperty";
import type { SerializationStatistics } from "../../unreal-engine/serialization/SerializationStatistics";
import type { UObject } from "../../unreal-engine/modules/CoreUObject/objects/Object";
import { FMatrix44 } from "../../unreal-engine/modules/CoreUObject/structs/Matrix44";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { Icon } from "@chakra-ui/icons";
import { makePropertyIcon } from "./MakePropertyIcon";
import type { ITextData } from "../../unreal-engine/types/Text";
import { ETextHistoryType, FTextHistory_Base } from "../../unreal-engine/types/Text";
import { FPerPlatformFloat } from "../../unreal-engine/modules/CoreUObject/structs/PerPlatformProperties";
import { isMissingImportedObject } from "../../unreal-engine/modules/mock-object";
import { USkeleton } from "../../unreal-engine/modules/Engine/objects/Skeleton";
import { FName, FNameMap } from "../../unreal-engine/types/Name";
import type { NativeStructs } from "../../unreal-engine/properties/NativeStructs";
import { FTransform } from "../../unreal-engine/modules/CoreUObject/structs/Transform";

export function ObjectPreview(props: { object: UObject }) {
  const exportedObjects = props.object;

  // Reject mock objects
  if (exportedObjects.isMockObject) {
    return (
      <Box p={2}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>{isMissingImportedObject(exportedObjects) ? "Missing object" : "Invalid object"}</AlertTitle>
          <AlertDescription>{exportedObjects.fullName}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  const statistics = exportedObjects.objectSource?.serializationStatistics;

  return (
    <Box>
      {statistics && renderStatistics(statistics)}
      <SimpleDetailsView>
        <CollapsableSection name={"Asset"}>
          <IndentedRow title={"Object"}>{renderObjectName(exportedObjects)}</IndentedRow>
          <IndentedRow title={"Class"}>{renderObjectName(exportedObjects.class)}</IndentedRow>
          <IndentedRow title={"Object Guid"}>{exportedObjects.objectGuid?.toString() || "None"}</IndentedRow>
        </CollapsableSection>
        {renderSpecificProperties(exportedObjects)}
        <CollapsableSection name={"Tagged Properties"}>
          {exportedObjects.properties.map((property, index) =>
            renderValue(index, property.nameString, property.value, makePropertyIcon(property.tag)),
          )}
        </CollapsableSection>
      </SimpleDetailsView>
    </Box>
  );
}

function renderObjectName(object: UObject | null) {
  if (!object) {
    return "null";
  }
  if (isMissingImportedObject(object)) {
    return <Box color={"red"}>Missing object: {object.fullName}</Box>;
  }
  return object.fullName;
}

export function AssetPreview(props: { asset: AssetApi }) {
  const exportedObjects = props.asset.mainObject;

  return exportedObjects ? <ObjectPreview object={exportedObjects} /> : <Box>Asset not found</Box>;
}

function makeIndexLabel(index: number) {
  return `Index [ ${index} ]`;
}

function renderTextData(textData: ITextData) {
  if (textData instanceof FTextHistory_Base) {
    return (
      <>
        <IndentedRow title={"Namespace"}>{textData.namespace}</IndentedRow>
        <IndentedRow title={"Key"}>{textData.key}</IndentedRow>
        <IndentedRow title={"Source String"}>{textData.getSourceString()}</IndentedRow>
      </>
    );
  }
  return undefined;
}

function renderSpecificProperties(object: UObject) {
  if (object instanceof USkeleton) {
    return (
      <CollapsableSection name={"Skeleton"}>
        {renderGenericProperty(0, "ReferenceSkeleton", object.ReferenceSkeleton)}
        {renderGenericProperty(0, "AnimRetargetSources", object.AnimRetargetSources)}
        {renderGenericProperty(0, "Guid", object.Guid)}
        {renderGenericProperty(0, "SmartNames", object.SmartNames)}
        {renderGenericProperty(0, "ExistingMarkerNames", object.ExistingMarkerNames)}
      </CollapsableSection>
    );
  }
  return null;
}

function getObjectSummary(value: object) {
  if (Array.isArray(value)) {
    return `size = ${value.length}`;
  }
  if ("summary" in value) {
    return String(value.summary) || undefined;
  }
  return undefined;
}

type GenericType = number | object | FNameMap<GenericType> | FName;

/**
 * Render an unknown type.
 */
function renderGenericProperty(key: number, title: string, value: GenericType, icon?: React.ReactElement) {
  if (value instanceof FNameMap) {
    return (
      <CollapsableSection initialExpanded={false} key={key} title={title} name={`size = ${value.size}`}>
        {value.map((mapKey, mapValue, mapIndex) => renderGenericProperty(mapIndex, mapKey.toString(), mapValue))}
      </CollapsableSection>
    );
  }
  if (value instanceof FName) {
    return (
      <IndentedRow key={key} title={title}>
        {value.toString()}
      </IndentedRow>
    );
  }
  if (value instanceof FTransform) {
    return renderNativeStructProperty(key, title, value);
  }
  if (typeof value === "object") {
    return (
      <CollapsableSection initialExpanded={false} key={key} icon={icon} title={title} name={getObjectSummary(value)}>
        {Object.entries(value).map(([subKey, subValue], index) => {
          return renderGenericProperty(index, subKey, subValue as GenericType);
        })}
      </CollapsableSection>
    );
  }
  return (
    <IndentedRow key={key} title={title}>
      {String(value)}
    </IndentedRow>
  );
}

function renderNativeStructProperty(
  key: number,
  name: string,
  value: NativeStructs,
  icon?: React.ReactElement,
): ReactNode {
  if (value instanceof FMatrix44) {
    return (
      <CollapsableSection initialExpanded={false} key={key} icon={icon} title={name} name={String(value)}>
        {value.matrix.map((item, index) => (
          <IndentedRow key={index} title={`M[${Math.floor(index / 4)}][${index % 4}]`}>
            {String(item)}
          </IndentedRow>
        ))}
      </CollapsableSection>
    );
  }
  if (value instanceof FPerPlatformFloat) {
    return (
      <CollapsableSection initialExpanded={false} key={key} icon={icon} title={name} name={String(value)}>
        <IndentedRow title={"Default"}>{value.Default}</IndentedRow>
        {value.PerPlatform.map((platform, value, index) => (
          <IndentedRow key={index} title={`Override [ ${platform} ]`}>
            {String(value)}
          </IndentedRow>
        ))}
      </CollapsableSection>
    );
  }
  const summary = value instanceof FTransform ? value.summary : String(value);
  return (
    <CollapsableSection initialExpanded={false} key={key} icon={icon} title={name} name={summary}>
      {Object.entries(value).map(([subKey, subValue], index) => (
        <IndentedRow key={index} title={subKey}>
          {String(subValue)}
        </IndentedRow>
      ))}
    </CollapsableSection>
  );
}

function renderValue(key: number, name: string, value: PropertyValue, icon?: React.ReactElement) {
  switch (value.type) {
    case "numeric":
    case "boolean":
    case "name":
    case "string":
      return (
        <IndentedRow key={key} icon={icon} title={name}>
          {String(value.value)}
        </IndentedRow>
      );
    case "text":
      return (
        <CollapsableSection key={key} initialExpanded={false} icon={icon} title={name} name={value.value.toString()}>
          <IndentedRow title={"Flags"}>{String(value.value.flags)}</IndentedRow>
          <IndentedRow title={"History Type"}>{ETextHistoryType[value.value.textHistoryType]}</IndentedRow>
          {renderTextData(value.value.textData)}
        </CollapsableSection>
      );
    case "object":
      return (
        <IndentedRow key={key} icon={icon} title={name}>
          {renderObjectName(value.object)}
        </IndentedRow>
      );
    case "struct":
      return (
        <CollapsableSection key={key} icon={icon} title={name} name={``}>
          {value.value.map((item, index) =>
            renderValue(index, item.nameString, item.value, makePropertyIcon(item.tag)),
          )}
        </CollapsableSection>
      );
    case "native-struct":
      return renderNativeStructProperty(key, name, value.value, icon);
    case "delegate":
      return (
        <IndentedRow key={key} icon={icon} title={name}>
          {renderObjectName(value.object)}::{value.function.text}
        </IndentedRow>
      );
    case "array":
      return (
        <CollapsableSection key={key} icon={icon} title={name} name={`${value.value.length} Array elements`}>
          {value.value.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
        </CollapsableSection>
      );
    case "set":
      return (
        <CollapsableSection
          key={key}
          icon={icon}
          title={name}
          name={
            <>
              {value.value.length} Set elements added
              {value.elementsToRemove.length > 0 ? <>, {value.elementsToRemove.length} removed</> : ""}{" "}
              {makeHelpSetMap()}
            </>
          }
        >
          <CollapsableSection
            title={"Removed elements"}
            name={`size = ${value.elementsToRemove.length}`}
            hasChildren={Boolean(value.elementsToRemove.length)}
          >
            {value.elementsToRemove.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
          </CollapsableSection>
          <CollapsableSection title={"Added elements"} name={`size = ${value.value.length}`}>
            {value.value.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
          </CollapsableSection>
        </CollapsableSection>
      );
    case "map":
      return (
        <CollapsableSection
          key={key}
          icon={icon}
          title={name}
          name={
            <>
              {value.value.length} Map elements added
              {value.elementsToRemove.length > 0 ? `, ${value.elementsToRemove.length} removed ` : " "}
              {makeHelpSetMap()}
            </>
          }
        >
          <CollapsableSection
            title={"Removed elements"}
            name={`size = ${value.elementsToRemove.length}`}
            hasChildren={Boolean(value.elementsToRemove.length)}
          >
            {value.elementsToRemove.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
          </CollapsableSection>
          <CollapsableSection title={"Added elements"} name={`size = ${value.value.length}`}>
            {value.value.map((item, index) => {
              const [key, value] = item;
              switch (key.type) {
                case "boolean":
                case "numeric":
                case "name":
                case "string":
                  // For simple keys we can collapse the key and value into one row
                  return renderValue(index, `Key [ ${key.value} ]`, value);
                default:
                  return (
                    <CollapsableSection key={index} name={`Entry ${index}`}>
                      {renderValue(0, "Key", key)}
                      {renderValue(1, "Value", value)}
                    </CollapsableSection>
                  );
              }
            })}
          </CollapsableSection>
        </CollapsableSection>
      );
    case "error":
      return (
        <IndentedRow key={key} icon={icon} title={name}>
          <Box color={"red"}>ERROR: {value.message}</Box>
        </IndentedRow>
      );
    default:
      // force compilation error if we forget to handle a case
      return throwBadPropertyValue(value);
  }
}

function makeHelpSetMap() {
  return (
    <MakeHelpTooltip
      label={
        "Sets and maps use a special serialization format: only added and removed elements are stored in the asset. The final property is computed by applying these changes to the default object."
      }
    />
  );
}

function renderStatistics(statistics: SerializationStatistics) {
  if (statistics.error) {
    return (
      <Box p={2}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>The reading of this asset failed; The asset is partially read.</AlertTitle>
            <AlertDescription>{statistics.error}</AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }
  if (statistics.extraBytes) {
    return (
      <Box p={2}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Object has {statistics.extraBytes} unparsed bytes.</AlertTitle>
        </Alert>
      </Box>
    );
  }
  return false;
}

export function MakeHelpTooltip(props: { label: ReactNode }) {
  return (
    <Tooltip label={props.label} verticalAlign="middle" placement={"top"} hasArrow>
      <span>
        <Icon mx={1} as={IoMdHelpCircleOutline} verticalAlign="middle" boxSize={5} />
      </span>
    </Tooltip>
  );
}

export function MakeHelpButtonTooltip(props: { label: string; onClick: () => void }) {
  return (
    <IconButton
      aria-label={props.label}
      onClick={props.onClick}
      variant={"link"}
      ml={1}
      icon={<Icon as={IoMdHelpCircleOutline} boxSize={5} />}
      minWidth={0}
      verticalAlign="middle"
    />
  );
}

function throwBadPropertyValue(value: never): never;
function throwBadPropertyValue(value: PropertyValue): never {
  throw new Error(`Unexpected property value ${value.type}`);
}
