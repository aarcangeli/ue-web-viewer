import { FAsset } from "../../unreal-engine/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React from "react";

export function SummaryDetails(props: { asset: FAsset }) {
  const summary = props.asset.summary;

  return (
    <SimpleDetailsView>
      <CollapsableSection name={"Summary"}>
        <IndentedRow title={"Tag"}>0x{summary.Tag.toString(16)}</IndentedRow>
        <IndentedRow title={"Byte Order"}>{summary.LittleEndian ? "Little Endian" : "Big Endian"}</IndentedRow>
        <IndentedRow title={"LegacyFileVersion"}>
          {summary.LegacyFileVersion} ({summary.LegacyFileVersion <= -8 ? "UE5+" : "UE4"})
        </IndentedRow>
        <IndentedRow title={"FileVersionUE4"}>{summary.FileVersionUE4}</IndentedRow>
        <IndentedRow title={"FileVersionUE5"}>{summary.FileVersionUE5}</IndentedRow>
        <CollapsableSection
          name={`Custom Versions (${summary.CustomVersionContainer.Versions.length})`}
          initialExpanded={false}
        >
          {summary.CustomVersionContainer.Versions.map((version, index) => (
            <IndentedRow key={index}>
              {version.Key.string} {"=>"} {version.Version}
            </IndentedRow>
          ))}
        </CollapsableSection>
        <IndentedRow title={"TotalHeaderSize"}>{summary.TotalHeaderSize}</IndentedRow>
        <IndentedRow title={"Package Name"}>{summary.PackageName}</IndentedRow>
        <IndentedRow title={"Package Flags"}>{summary.PackageFlags}</IndentedRow>
        <IndentedRow title={"Name Count"}>{summary.NameCount}</IndentedRow>
        <IndentedRow title={"Name Offset"}>{summary.NameOffset}</IndentedRow>
        <IndentedRow title={"Export Count"}>{summary.ExportCount}</IndentedRow>
        <IndentedRow title={"Export Offset"}>{summary.ExportOffset}</IndentedRow>
        <IndentedRow title={"Import Count"}>{summary.ImportCount}</IndentedRow>
        <IndentedRow title={"Import Offset"}>{summary.ImportOffset}</IndentedRow>
        <IndentedRow title={"Depends Offset"}>{summary.DependsOffset}</IndentedRow>
        <IndentedRow title={"Guid"}>{summary.Guid.string}</IndentedRow>
        <IndentedRow title={"Persistent Guid"}>{summary.PersistentGuid.string}</IndentedRow>
      </CollapsableSection>
    </SimpleDetailsView>
  );
}
