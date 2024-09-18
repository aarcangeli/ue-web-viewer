import { Flex } from "@chakra-ui/react";
import { FileApi } from "./filesystem/FileApi";
import React, { useEffect } from "react";
import { AssetReader } from "./unreal/AssetReader";
import { FPackageFileSummary } from "./unreal/structs";
import invariant from "tiny-invariant";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "./components/SimpleDetailsView";

export interface Props {
  file: FileApi;
}

async function ReadAndParseFile(file: FileApi) {
  const content = await file.read();
  const reader = new AssetReader(content);
  let summary = FPackageFileSummary.fromStream(reader);
  return { summary };
}

export function SummaryDetails(props: { summary: FPackageFileSummary }) {
  const summary = props.summary;

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

export function FileViewer(props: Props) {
  invariant(props.file.kind === "file", "Expected a file");

  const [summary, setSummary] = React.useState<FPackageFileSummary>();

  useEffect(() => {
    setSummary(undefined);
    ReadAndParseFile(props.file)
      .then((result) => setSummary(result.summary))
      .catch((error) => {
        console.error(error);
      });
  }, [props.file]);

  return (
    <Flex grow={1} direction={"column"} alignItems={"stretch"} overflowY={"auto"}>
      {summary && <SummaryDetails summary={summary} />}
    </Flex>
  );
}
