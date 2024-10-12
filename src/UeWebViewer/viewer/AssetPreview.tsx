import type { Asset } from "../../unreal-engine/serialization/Asset";
import React from "react";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Tooltip } from "@chakra-ui/react";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import type { PropertyValue } from "../../unreal-engine/properties/properties";
import type { SerializationStatistics } from "../../unreal-engine/serialization/SerializationStatistics";
import type { UObject } from "../../unreal-engine/modules/CoreUObject/objects/Object";
import { FMatrix44 } from "../../unreal-engine/modules/CoreUObject/structs/Matrix44";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { Icon } from "@chakra-ui/icons";

export function ObjectPreview(props: { object: UObject }) {
  const exportedObjects = props.object;

  const statistics = exportedObjects.serializationStatistics;

  return (
    <Box>
      {statistics && renderStatistics(statistics)}
      <SimpleDetailsView>
        <CollapsableSection name={"Asset"}>
          <IndentedRow title={"Object"}>{exportedObjects.fullName}</IndentedRow>
          <IndentedRow title={"Class"}>{exportedObjects.class.fullName}</IndentedRow>
          <IndentedRow title={"Object Guid"}>{exportedObjects.objectGuid?.toString() || "None"}</IndentedRow>
        </CollapsableSection>
        <CollapsableSection name={"Properties"}>
          {exportedObjects.properties.map((property, index) => renderValue(index, property.nameString, property.value))}
        </CollapsableSection>
      </SimpleDetailsView>
    </Box>
  );
}

export function AssetPreview(props: { asset: Asset }) {
  const exportedObjects = props.asset.mainObject;

  return exportedObjects ? <ObjectPreview object={exportedObjects} /> : <Box>Asset not found</Box>;
}

function makeIndexLabel(index: number) {
  return `Index [ ${index} ]`;
}

function renderValue(key: number, name: string, value: PropertyValue) {
  switch (value.type) {
    case "numeric":
    case "boolean":
    case "name":
    case "string":
      return (
        <IndentedRow key={key} title={name}>
          {`${value.value}`}
        </IndentedRow>
      );
    case "object":
      return (
        <IndentedRow key={key} title={name}>
          {value.object?.fullName ?? "null"}
        </IndentedRow>
      );
    case "struct":
      return (
        <CollapsableSection key={key} title={name} name={``}>
          {value.value.map((item, index) => renderValue(index, item.nameString, item.value))}
        </CollapsableSection>
      );
    case "native-struct":
      if (value.value instanceof FMatrix44) {
        return (
          <CollapsableSection initialExpanded={false} key={key} title={name} name={String(value.value)}>
            {value.value.matrix.map((item, index) => (
              <IndentedRow key={index} title={`M[${Math.floor(index / 4)}][${index % 4}]`}>
                {String(item)}
              </IndentedRow>
            ))}
          </CollapsableSection>
        );
      }
      return (
        <CollapsableSection key={key} title={name} name={String(value.value)}>
          {Object.keys(value.value).map((subKey, index) => (
            <IndentedRow key={index} title={subKey}>
              {String(value.value[subKey])}
            </IndentedRow>
          ))}
        </CollapsableSection>
      );
    case "delegate":
      return (
        <IndentedRow key={key} title={name}>
          {value.object?.fullName ?? "null"}::{value.function.text}
        </IndentedRow>
      );
    case "array":
      return (
        <CollapsableSection key={key} title={name} name={`${value.value.length} Array elements`}>
          {value.value.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
        </CollapsableSection>
      );
    case "set":
      return (
        <CollapsableSection
          key={key}
          title={name}
          name={
            <>
              {value.value.length} Set elements added
              {value.elementsToRemove.length > 0 ? <>, {value.elementsToRemove.length} removed</> : ""}{" "}
              {makeHelpSetMap()}
            </>
          }
        >
          {value.elementsToRemove.length > 0 && (
            <CollapsableSection title={"Removed elements"} name={`size = ${value.elementsToRemove.length}`}>
              {value.elementsToRemove.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
            </CollapsableSection>
          )}
          <CollapsableSection title={"Added elements"} name={`size = ${value.value.length}`}>
            {value.value.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
          </CollapsableSection>
        </CollapsableSection>
      );
    case "map":
      return (
        <CollapsableSection
          key={key}
          title={name}
          name={
            <>
              {value.value.length} Map elements added
              {value.elementsToRemove.length > 0 ? <>, {value.elementsToRemove.length} removed</> : ""}{" "}
              {makeHelpSetMap()}
            </>
          }
        >
          {value.elementsToRemove.length > 0 && (
            <CollapsableSection title={"Removed elements"} name={`size = ${value.elementsToRemove.length}`}>
              {value.elementsToRemove.map((item, index) => renderValue(index, makeIndexLabel(index), item))}
            </CollapsableSection>
          )}
          <CollapsableSection title={"Added elements"} name={`size = ${value.value.length}`}>
            {value.value.map((item, index) => renderValue(index, makeMapKey(item[0]), item[1]))}
          </CollapsableSection>
        </CollapsableSection>
      );
    case "error":
      return (
        <IndentedRow key={key} title={name}>
          <Box color={"red"}>ERROR: {value.message}</Box>
        </IndentedRow>
      );
    default:
      // force compilation error if we forget to handle a case
      return throwBadPropertyValue(value);
  }
}

function makeMapKey(key: PropertyValue): string {
  // Only scalar types are allowed as map keys
  switch (key.type) {
    case "boolean":
    case "numeric":
    case "name":
    case "string":
      return `Key [ ${key.value} ]`;
    default:
      console.error(`Unknown key ${key}`);
      return `Unknown key ${key}`;
  }
}

function makeHelpSetMap() {
  return (
    <MakeHelpTooltip
      title={
        "Only added and removed elements are serialized on the asset, the diff applied to a default object to generate the final property element."
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

function MakeHelpTooltip(props: { title: string }) {
  return (
    <Tooltip label={props.title} verticalAlign="middle" placement={"top"} hasArrow>
      <span>
        <Icon as={IoMdHelpCircleOutline} verticalAlign="middle" boxSize={5} />
      </span>
    </Tooltip>
  );
}

function throwBadPropertyValue(value: never): never;
function throwBadPropertyValue(value: PropertyValue): never {
  throw new Error(`Unexpected property value ${value.type}`);
}
