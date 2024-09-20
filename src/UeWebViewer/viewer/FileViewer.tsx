import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { FileApi } from "../filesystem/FileApi";
import React, { useEffect, useState } from "react";
import { FullAssetReader } from "../../unreal-engine/AssetReader";
import invariant from "tiny-invariant";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import { FAsset } from "../../unreal-engine/Asset";
import { ImportDetails } from "./ImportDetails";

export interface Props {
  file: FileApi;
}

async function ReadAndParseFile(file: FileApi) {
  const content = await file.read();
  const reader = new FullAssetReader(content);
  return FAsset.fromStream(reader);
}

export function SummaryDetails(props: { asset: FAsset }) {
  const summary = props.asset.summary;

  return (
    <SimpleDetailsView>
      <CollapsableSection name={"Summary"}>
        <IndentedRow>Tag: {summary.Tag}</IndentedRow>
        <IndentedRow>
          LegacyFileVersion: {summary.LegacyFileVersion} ({summary.LegacyFileVersion <= -8 ? "UE5+" : "UE4"})
        </IndentedRow>
        <IndentedRow>FileVersionUE4: {summary.FileVersionUE4}</IndentedRow>
        <IndentedRow>FileVersionUE5: {summary.FileVersionUE5}</IndentedRow>
        <CollapsableSection
          name={`Custom Versions (${summary.CustomVersionContainer.Versions.length})`}
          initialExpanded={false}
        >
          {summary.CustomVersionContainer.Versions.map((version, index) => (
            <IndentedRow key={index}>
              Key: {version.Key.string}; Version: {version.Version}
            </IndentedRow>
          ))}
        </CollapsableSection>
        <IndentedRow>TotalHeaderSize: {summary.TotalHeaderSize}</IndentedRow>
        <IndentedRow>Package Name: {summary.PackageName}</IndentedRow>
        <IndentedRow>Package Flags: {summary.PackageFlags}</IndentedRow>
        <IndentedRow>Name Count: {summary.NameCount}</IndentedRow>
        <IndentedRow>Name Offset: {summary.NameOffset}</IndentedRow>
        <IndentedRow>Export Count: {summary.ExportCount}</IndentedRow>
        <IndentedRow>Export Offset: {summary.ExportOffset}</IndentedRow>
        <IndentedRow>Import Count: {summary.ImportCount}</IndentedRow>
        <IndentedRow>Import Offset: {summary.ImportOffset}</IndentedRow>
        <IndentedRow>Depends Offset: {summary.DependsOffset}</IndentedRow>
        <IndentedRow>Guid: {summary.Guid.string}</IndentedRow>
        <IndentedRow>Persistent Guid: {summary.PersistentGuid.string}</IndentedRow>
      </CollapsableSection>
      <CollapsableSection name={"Extra"}>
        <IndentedRow>asd</IndentedRow>
      </CollapsableSection>
    </SimpleDetailsView>
  );
}

function ExportDetails(props: { asset: FAsset }) {
  console.log("ExportDetails", props.asset);
  const exports = props.asset.exports;

  return (
    <SimpleDetailsView>
      <CollapsableSection name={`Exports (${exports.length})`}>
        {exports.map((value, index) => (
          <CollapsableSection name={`Export ${index + 1}`} key={index}>
            <IndentedRow>Class Index: {value.ClassIndex}</IndentedRow>
            <IndentedRow>Outer Index: {value.OuterIndex}</IndentedRow>
            <IndentedRow>ObjectName: {value.ObjectName}</IndentedRow>
          </CollapsableSection>
        ))}
      </CollapsableSection>
    </SimpleDetailsView>
  );
}

const tabNames = [
  { id: "summary", name: "Summary", component: SummaryDetails },
  { id: "imports", name: "Imports", component: ImportDetails },
  { id: "exports", name: "Exports", component: ExportDetails },
];

function getTabIndexFromHash() {
  if (document.location.hash) {
    let hash = document.location.hash.slice(1).toLowerCase();
    return tabNames.findIndex((tab) => tab.id === hash);
  }
  return 0;
}

export function FileViewer(props: Props) {
  invariant(props.file.kind === "file", "Expected a file");
  const [tabIndex, setTabIndex] = useState(getTabIndexFromHash);

  const [asset, setAsset] = React.useState<FAsset>();

  useEffect(() => {
    console.log("Reading file", props.file.fullPath);
    setAsset(undefined);
    ReadAndParseFile(props.file)
      .then((asset) => setAsset(asset))
      .catch((error) => {
        console.error(error);
      });
  }, [props.file]);

  useEffect(() => {
    const hashChange = () => {
      setTabIndex(getTabIndexFromHash());
    };
    window.addEventListener("hashchange", hashChange);
    return () => window.removeEventListener("hashchange", hashChange);
  }, []);

  const onChange = (index: number) => {
    document.location.hash = tabNames[index].id;
    setTabIndex(index);
  };

  return (
    <Flex grow={1} direction={"column"} alignItems={"stretch"} overflowY={"auto"}>
      {asset && (
        <Tabs isLazy index={tabIndex} onChange={onChange}>
          <TabList>
            {tabNames.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {tabNames.map((tab, index) => (
              <TabPanel key={index}>
                <tab.component asset={asset} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
    </Flex>
  );
}
