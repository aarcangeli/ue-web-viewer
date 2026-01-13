import { Center, Flex, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import type { FileApi } from "../../unreal-engine/fileSystem/FileApi";
import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { ImportDetails } from "./ImportDetails";
import { ExportDetails } from "./ExportDetails";
import { SummaryDetails } from "./SummaryDetails";
import { AssetPreview } from "./AssetPreview";
import type { Container } from "../../unreal-engine/container";
import { useAsyncCompute } from "../../utils/async-compute";

const tabNames = [
  { id: "preview", name: "Preview", component: AssetPreview },
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

export function FileViewer(props: { file: FileApi; container: Container }) {
  const file = props.file;
  const container = props.container;

  invariant(file.kind === "file", "Expected a file");
  const [tabIndex, setTabIndex] = useState(getTabIndexFromHash);

  const asset = useAsyncCompute(() => container.objectLoader.loadPackage(file), [container, file]);
  const assetApi = asset.data?.assetApi;

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

  const isNull = !assetApi && !asset.isLoading && !asset.error;

  return (
    <Flex grow={1} direction={"column"} alignItems={"stretch"} overflowY={"auto"}>
      {asset.error && (
        <Flex color={"red.500"} p={4}>
          Error loading asset: {asset.error.message}
        </Flex>
      )}

      {asset.isLoading && (
        <Center flexGrow={1}>
          <Spinner />
        </Center>
      )}

      {assetApi && (
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
                p={0}
                minHeight={0}
                flex={1}
                height={"100%"}
                display={"flex"}
                flexDirection={"column"}
              >
                <tab.component asset={assetApi} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}

      {isNull && <Flex p={4}>Cannot display this file.</Flex>}
    </Flex>
  );
}
