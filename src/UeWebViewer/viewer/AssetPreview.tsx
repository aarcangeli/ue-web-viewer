import { Asset } from "../../unreal-engine/Asset";
import React from "react";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from "@chakra-ui/react";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import { PropertyValue } from "../../unreal-engine/properties/properties";
import { SerializationStatistics } from "../../unreal-engine/structs/SerializationStatistics";
import { UObject } from "../../unreal-engine/objects/CoreUObject/Object";

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
    case "delegate":
      return (
        <IndentedRow key={key} title={name}>
          {value.object?.fullName ?? "null"}::{value.function.text}
        </IndentedRow>
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

function renderStatistics(statistics: SerializationStatistics) {
  if (statistics.error) {
    return (
      <Box p={2}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>The reading of this asset failed; only partial data is available.</AlertTitle>
          <AlertDescription>{statistics.error}</AlertDescription>
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

function throwBadPropertyValue(value: never): never;
function throwBadPropertyValue(value: PropertyValue): never {
  throw new Error(`Unexpected property value ${value.type}`);
}
