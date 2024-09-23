import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { FileApi } from "../filesystem/FileApi";
import React, { useEffect, useState } from "react";
import { FullAssetReader } from "../../unreal-engine/AssetReader";
import invariant from "tiny-invariant";
import { FAsset } from "../../unreal-engine/Asset";
import { ImportDetails } from "./ImportDetails";
import { ExportDetails } from "./ExportDetails";
import { SummaryDetails } from "./SummaryDetails";
import { AssetPreview } from "./AssetPreview";

export interface Props {
  file: FileApi;
}

async function ReadAndParseFile(file: FileApi) {
  const content = await file.read();
  const reader = new FullAssetReader(content);
  return FAsset.fromStream(reader);
}

const tabNames = [
  { id: "preview", name: "Preview", component: AssetPreview, isFullSize: true },
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
        <Tabs
          isLazy
          index={tabIndex}
          onChange={onChange}
          flexGrow={1}
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          minHeight={0}
        >
          <TabList>
            {tabNames.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>

          <TabPanels flex={1} minHeight={0}>
            {tabNames.map((tab, index) => (
              <TabPanel
                key={index}
                p={tab.isFullSize ? 0 : undefined}
                minHeight={0}
                flex={1}
                height={"100%"}
                display={"flex"}
                flexDirection={"column"}
              >
                <tab.component asset={asset} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
    </Flex>
  );
}
