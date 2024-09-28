import { Asset } from "../../unreal-engine/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React, { useMemo } from "react";
import { FObjectImport } from "../../unreal-engine/structs/ObjectImport";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { partition } from "../../utils/partition";
import { ProjectApi, useProjectApi } from "../ProjectApi";
import { makeObjectTitle } from "./commons";
import { FName } from "../../unreal-engine/structs/Name";

const CoreUObject = FName.fromString("/Script/CoreUObject");

class Node {
  constructor(
    public readonly objectImport: FObjectImport,
    public readonly index: number,
    public readonly children: Node[] = [],
  ) {}

  get ClassPackage() {
    return this.objectImport.ClassPackage;
  }

  get ClassName() {
    return this.objectImport.ClassName;
  }

  get OuterIndex() {
    return this.objectImport.OuterIndex;
  }

  get ObjectName() {
    return this.objectImport.ObjectName;
  }
}

function makeTree(imports: FObjectImport[]): Node[] {
  const sortNodesRecursively = (convertedTable: Node[]) => {
    convertedTable.sort((a: Node, b: Node) => {
      return (
        a.ClassPackage.localeCompare(b.ClassPackage) ||
        a.ClassName.localeCompare(b.ClassName) ||
        a.ObjectName.localeCompare(b.ObjectName)
      );
    });

    for (const value of convertedTable) {
      sortNodesRecursively(value.children);
    }
  };

  const convertedTable = imports.map((value, index) => new Node(value, -index - 1));

  for (const value of convertedTable) {
    if (value.objectImport.OuterIndex < 0) {
      const index = -value.objectImport.OuterIndex - 1;
      convertedTable[index].children.push(value);
    }
  }

  // sort recursively
  sortNodesRecursively(convertedTable);

  return convertedTable.filter((value) => value.objectImport.OuterIndex === 0);
}

function makeTitle(projectApi: ProjectApi, node: Node) {
  let onClick: (() => void) | undefined = undefined;

  if (node.OuterIndex == 0 && node.ObjectName.startsWith("/Game/")) {
    onClick = () => projectApi.openAsset(node.ObjectName);
  }

  return makeObjectTitle({
    onClick,
    objectName: node.ObjectName,
    objectClass: node.ClassPackage.equals(CoreUObject) ? node.ClassName.text : `${node.ClassPackage}.${node.ClassName}`,
  });
}

function RenderNodes(props: { tree: Node[] }) {
  const projectApi = useProjectApi();

  const recursiveSection = (node: Node) => (
    <CollapsableSection key={node.index} name={makeTitle(projectApi, node)} hasChildren={Boolean(node.children.length)}>
      {node.children.map(recursiveSection)}
    </CollapsableSection>
  );

  return <SimpleDetailsView>{props.tree.map(recursiveSection)}</SimpleDetailsView>;
}

function RawView(props: { asset: Asset }) {
  return (
    <SimpleDetailsView>
      {props.asset.imports.map((value, index) => (
        <CollapsableSection name={`Import ${-index - 1}`} key={index}>
          <IndentedRow title={"Class Package"}>{value.ClassPackage.text}</IndentedRow>
          <IndentedRow title={"Class Name"}>{value.ClassName.text}</IndentedRow>
          <IndentedRow title={"Outer Index"}>{value.OuterIndex}</IndentedRow>
          <IndentedRow title={"Object Name"}>{value.ObjectName.text}</IndentedRow>
          <IndentedRow title={"Package Name"}>{value.PackageName.text}</IndentedRow>
          <IndentedRow title={"bImportOptional"}>{value.bImportOptional ? "true" : "false"}</IndentedRow>
        </CollapsableSection>
      ))}
    </SimpleDetailsView>
  );
}

export function ImportDetails(props: { asset: Asset }) {
  const imports = props.asset.imports;

  const tree = useMemo(() => makeTree(imports), [imports]);
  const [scriptImports, objectImports] = partition(tree, (node) => node.ObjectName.startsWith("/Script/"));

  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Assets ({objectImports.length})</Tab>
        <Tab>Scripts ({scriptImports.length})</Tab>
        <Tab>Raw</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RenderNodes tree={objectImports} />
        </TabPanel>
        <TabPanel>
          <RenderNodes tree={scriptImports} />
        </TabPanel>
        <TabPanel>
          <RawView asset={props.asset} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
