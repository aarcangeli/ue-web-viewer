import type { AssetApi } from "../../unreal-engine/serialization/Asset";
import { CollapsableSection, IndentedRow, SimpleDetailsView } from "../components/SimpleDetailsView";
import React from "react";
import { allCustomVersions } from "../../unreal-engine/versioning/ue-custom-versions";
import type { FCustomVersion } from "../../unreal-engine/serialization/CustomVersion";
import { MakeHelpTooltip } from "./AssetPreview";
import { ListItem, UnorderedList } from "@chakra-ui/react";
import type { CustomVersionGuid } from "../../unreal-engine/versioning/CustomVersionGuid";

type ResolvedVersion = {
  versionGuid: CustomVersionGuid | undefined;
  name: string;
  value: number;
};

export function SummaryDetails(props: { asset: AssetApi }) {
  const summary = props.asset.summary;

  const customVersions = summary.CustomVersionContainer.Versions.map(findCustomVersion).toSorted((a, b) => {
    if (Boolean(a.versionGuid) !== Boolean(b.versionGuid)) {
      // Sort the one with versionGuid first
      return a.versionGuid ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

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
                  <b>-8</b>: First UE5 release (UE5.0 - UE5.5)
                </ListItem>
                <ListItem>
                  <b>-9</b>: Just a policy update (UE5.6+)
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
          {customVersions.map((version, index) => (
            <IndentedRow key={index}>
              {version.name} {"=>"} {version.value}
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

function findCustomVersion(version: FCustomVersion): ResolvedVersion {
  const versionGuid = allCustomVersions.find((v) => v.guid.equals(version.Key));
  return {
    versionGuid: versionGuid,
    name: versionGuid ? versionGuid.name.toString() : version.Key.toString(),
    value: version.Version,
  };
}
