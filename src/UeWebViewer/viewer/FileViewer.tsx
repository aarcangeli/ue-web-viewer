import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import type { FileApi } from "../filesystem/FileApi";
import React, { useEffect, useState } from "react";
import { FullAssetReader } from "../../unreal-engine/AssetReader";
import invariant from "tiny-invariant";
import { Asset } from "../../unreal-engine/serialization/Asset";
import { ImportDetails } from "./ImportDetails";
import { ExportDetails } from "./ExportDetails";
import { SummaryDetails } from "./SummaryDetails";
import { AssetPreview } from "./AssetPreview";

export interface Props {
  file: FileApi;
}

async function ReadAndParseFile(file: FileApi) {
  const loadAsset = async () => {
    const content = await file.read();
    return new FullAssetReader(new DataView(content));
  };
  return new Asset(file.name, await loadAsset(), loadAsset);
}

const tabNames = [
  { id: "preview", name: "Preview", component: AssetPreview, isFullSize: true },
  { id: "summary", name: "Summary", component: SummaryDetails },
  { id: "imports", name: "Imports", component: ImportDetails },
  { id: "exports", name: "Exports", component: ExportDetails },
];

function getTabIndexFromHash() {
  if (document.location.hash) {
    const hash = document.location.hash.slice(1).toLowerCase();
    return tabNames.findIndex((tab) => tab.id === hash);
  }
  return 0;
}

export function FileViewer(props: Props) {
  invariant(props.file.kind === "file", "Expected a file");
  const [tabIndex, setTabIndex] = useState(getTabIndexFromHash);

  const [asset, setAsset] = React.useState<Asset>();

  useEffect(() => {
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
    <Flex
      grow={1}
      direction={"column"}
      alignItems={"stretch"}
      overflowY={"auto"}
    >
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
