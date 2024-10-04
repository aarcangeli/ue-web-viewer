import { Asset } from "../../unreal-engine/serialization/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React, { useMemo } from "react";
import {
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { exportFlagsToString, FObjectExport } from "../../unreal-engine/structs/ObjectExport";
import invariant from "tiny-invariant";
import { makeObjectTitle } from "./commons";
import { removePrefix } from "../../utils/string-utils";
import { IoOpenOutline, IoReload } from "react-icons/io5";
import { ObjectPreview } from "./AssetPreview";

class Node {
  constructor(
    public readonly objectExport: FObjectExport,
    public readonly index: number,
    public readonly classFullName: string,
    public readonly children: Node[] = [],
  ) {}
}

function makeTree(asset: Asset): Node[] {
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
    const fullName = asset.makeFullName(exportObject.ClassIndex);
    return new Node(exportObject, index + 1, fullName);
  });

  for (const value of convertedTable) {
    if (value.objectExport.OuterIndex > 0) {
      const index = value.objectExport.OuterIndex - 1;
      invariant(index < convertedTable.length, `Invalid index ${index} for node ${value}`);
      convertedTable[index].children.push(value);
    } else if (value.objectExport.OuterIndex !== 0) {
      console.error("Detected subobject of import");
    }
  }

  // sort recursively
  sortNodesRecursively(convertedTable);

  return convertedTable.filter((value) => value.objectExport.OuterIndex === 0);
}

function RawView(props: { asset: Asset }) {
  const exports = props.asset.exports;

  return (
    <SimpleDetailsView>
      {exports.map((value, index) => (
        <CollapsableSection name={`Export ${index + 1}`} key={index}>
          <IndentedRow title={"Class Index"}>{value.ClassIndex}</IndentedRow>
          <IndentedRow title={"Super Index"}>{value.SuperIndex}</IndentedRow>
          <IndentedRow title={"Template Index"}>{value.TemplateIndex}</IndentedRow>
          <IndentedRow title={"Outer Index"}>{value.OuterIndex}</IndentedRow>
          <IndentedRow title={"Object Name"}>{value.ObjectName.text}</IndentedRow>
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

function OpenObjectPreviewButton(props: { asset: Asset; index: number }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton aria-label={"Open Object"} size={"xs"} variant={"ghost"} icon={<IoOpenOutline />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ObjectPreviewContent asset={props.asset} index={props.index} />
      </Modal>
    </>
  );
}

function ObjectPreviewContent(props: { asset: Asset; index: number }) {
  const [asset, setAsset] = React.useState(props.asset);
  const [object, setObject] = React.useState(() => props.asset.getObjectByIndex(props.index));

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Object Preview
          <IconButton
            aria-label={"Refresh Asset"}
            size={"xs"}
            variant={"ghost"}
            icon={<IoReload />}
            onClick={() => {
              asset.reloadAsset().then((asset) => {
                console.log("Reloaded asset", asset);
                setAsset(asset);
                setObject(asset.getByFullName(object.fullName));
              });
            }}
          />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ObjectPreview object={object} />
        </ModalBody>
      </ModalContent>
    </>
  );
}

function RenderNodes(props: { asset: Asset; tree: Node[] }) {
  const recursiveSection = (node: Node) => (
    <CollapsableSection
      key={node.index}
      name={
        <>
          {makeObjectTitle({
            objectName: node.objectExport.ObjectName,
            objectClass: removePrefix(node.classFullName, "/Script/Engine."),
          })}
          <OpenObjectPreviewButton index={node.index} asset={props.asset} />
        </>
      }
      hasChildren={Boolean(node.children.length)}
    >
      {node.children.map(recursiveSection)}
    </CollapsableSection>
  );

  return <SimpleDetailsView>{props.tree.map(recursiveSection)}</SimpleDetailsView>;
}

export function ExportDetails(props: { asset: Asset }) {
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
          <RenderNodes asset={asset} tree={tree} />
        </TabPanel>
        <TabPanel>
          <RawView asset={props.asset} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
