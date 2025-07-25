import type { Asset } from "../../unreal-engine/serialization/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React from "react";
import { allCustomVersions } from "../../unreal-engine/versioning/ue-custom-versions";
import type { FCustomVersion } from "../../unreal-engine/serialization/CustomVersion";
import { MakeHelpTooltip } from "./AssetPreview";
import { ListItem, UnorderedList } from "@chakra-ui/react";

export function SummaryDetails(props: { asset: Asset }) {
  const summary = props.asset.summary;

  return (
    <SimpleDetailsView>
      <CollapsableSection name={"Summary"}>
        <IndentedRow title={"Tag"}>0x{summary.Tag.toString(16)}</IndentedRow>
        <IndentedRow title={"Byte Order"}>{summary.LittleEndian ? "Little Endian" : "Big Endian"}</IndentedRow>
        <IndentedRow title={"LegacyFileVersion"}>
          {summary.LegacyFileVersion} (
          {summary.LegacyFileVersion <= -9 ? "UE5.6+" : summary.LegacyFileVersion <= -8 ? "UE5" : "UE4"})
          <MakeHelpTooltip
            label={
              <UnorderedList>
                <ListItem>
                  <b>-8</b>: First UE5 release
                </ListItem>
                <ListItem>
                  <b>-9</b>: Just a policy update, introduced in UE5.6
                </ListItem>
              </UnorderedList>
            }
          />
        </IndentedRow>
        <IndentedRow title={"FileVersionUE4"}>{summary.FileVersionUE4}</IndentedRow>
        <IndentedRow title={"FileVersionUE5"}>{summary.FileVersionUE5}</IndentedRow>
        <CollapsableSection
          name={`Custom Versions (${summary.CustomVersionContainer.Versions.length})`}
          initialExpanded={false}
        >
          {summary.CustomVersionContainer.Versions.map((version, index) => (
            <IndentedRow key={index}>
              {version.Key.toString()} {"=>"} {version.Version} {getVersionName(version)}
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
        <IndentedRow title={"Saved Hash (ex Guid)"}>{summary.SavedHash.toString()}</IndentedRow>
        <IndentedRow title={"Persistent Guid"}>{summary.PersistentGuid.toString()}</IndentedRow>
      </CollapsableSection>
    </SimpleDetailsView>
  );
}

function getVersionName(version: FCustomVersion) {
  const customVersion = allCustomVersions.find((v) => v.guid.equals(version.Key));
  if (customVersion) {
    const value = customVersion.details.find((v) => v.value === version.Version);
    if (value) {
      return (
        <MakeHelpTooltip
          label={
            <UnorderedList p={1}>
              <ListItem>
                <b>Enum Name:</b> {customVersion.name.toString()}
              </ListItem>
              <ListItem>
                <b>Value:</b> {value.value}
              </ListItem>
              <ListItem>
                <b>Value Name:</b> <i>{value.name}</i>
              </ListItem>
              <ListItem>
                <b>First Appearance:</b>
                {value.firstAppearance}
              </ListItem>
            </UnorderedList>
          }
        ></MakeHelpTooltip>
      );
    }
    return `(${customVersion.name})`;
  }
  return "";
}
