import { FAsset } from "../../unreal-engine/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React, { useMemo } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { exportFlagsToString, FObjectExport } from "../../unreal-engine/structs/ObjectExport";
import invariant from "tiny-invariant";
import { makeObjectTitle } from "./commons";
import { removePrefix } from "../../utils/string-utils";

class Node {
  constructor(
    public readonly objectExport: FObjectExport,
    public readonly index: number,
    public readonly classFullName: string,
    public readonly children: Node[] = [],
  ) {}
}

function makeTree(asset: FAsset): Node[] {
  const sortNodesRecursively = (convertedTable: Node[]) => {
    convertedTable.sort((a: Node, b: Node) => {
      return (
        a.classFullName.localeCompare(b.classFullName) ||
        a.objectExport.ObjectName.localeCompare(b.objectExport.ObjectName)
      );
    });

    for (const value of convertedTable) {
      sortNodesRecursively(value.children);
    }
  };

  const convertedTable = asset.exports.map((exportObject, index) => {
    let fullName = asset.makeFullName(exportObject.ClassIndex);
    return new Node(exportObject, index + 1, fullName);
  });

  for (const value of convertedTable) {
    if (value.objectExport.OuterIndex > 0) {
      const index = value.objectExport.OuterIndex - 1;
      invariant(index < convertedTable.length, `Invalid index ${index} for node ${value}`);
      convertedTable[index].children.push(value);
    } else if (value.objectExport.OuterIndex != 0) {
      console.log("Detected subobject of import");
    }
  }

  // sort recursively
  sortNodesRecursively(convertedTable);

  return convertedTable.filter((value) => value.objectExport.OuterIndex == 0);
}

function RawView(props: { asset: FAsset }) {
  const exports = props.asset.exports;

  return (
    <SimpleDetailsView>
      {exports.map((value, index) => (
        <CollapsableSection name={`Export ${index + 1}`} key={index}>
          <IndentedRow title={"Class Index"}>{value.ClassIndex}</IndentedRow>
          <IndentedRow title={"Super Index"}>{value.SuperIndex}</IndentedRow>
          <IndentedRow title={"Template Index"}>{value.TemplateIndex}</IndentedRow>
          <IndentedRow title={"Outer Index"}>{value.OuterIndex}</IndentedRow>
          <IndentedRow title={"Object Name"}>{value.ObjectName}</IndentedRow>
          <IndentedRow title={"Object Flags"}>
            {value.objectFlags} ({exportFlagsToString(value.objectFlags)})
          </IndentedRow>
          <IndentedRow title={"Package Flags"}>{value.packageFlags}</IndentedRow>
          <IndentedRow title={"bIsAsset"}>{String(value.bIsAsset)}</IndentedRow>
        </CollapsableSection>
      ))}
    </SimpleDetailsView>
  );
}

function RenderNodes(props: { tree: Node[] }) {
  const recursiveSection = (node: Node) => (
    <CollapsableSection
      key={node.index}
      name={makeObjectTitle({
        objectName: node.objectExport.ObjectName,
        objectClass: removePrefix(node.classFullName, "/Script/Engine."),
      })}
      hasChildren={Boolean(node.children.length)}
    >
      {node.children.map(recursiveSection)}
    </CollapsableSection>
  );

  return <SimpleDetailsView>{props.tree.map(recursiveSection)}</SimpleDetailsView>;
}

export function ExportDetails(props: { asset: FAsset }) {
  const asset = props.asset;
  const tree = useMemo(() => makeTree(asset), [asset]);

  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Objects ({props.asset.exports.length})</Tab>
        <Tab>Raw</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RenderNodes tree={tree} />
        </TabPanel>
        <TabPanel>
          <RawView asset={props.asset} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
