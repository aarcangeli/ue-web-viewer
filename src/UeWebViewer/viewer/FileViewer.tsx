import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import type { FileApi } from "../../unreal-engine/fileSystem/FileApi";
import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import type { AssetApi } from "../../unreal-engine/serialization/Asset";
import { openAssetFromDataView } from "../../unreal-engine/serialization/Asset";
import { ImportDetails } from "./ImportDetails";
import { ExportDetails } from "./ExportDetails";
import { SummaryDetails } from "./SummaryDetails";
import { AssetPreview } from "./AssetPreview";
import { MakeObjectContext } from "../../unreal-engine/types/object-context";

// async function resolvePath(file: FileApi, path: string) {
//   for (const string of path.split("/")) {
//     // Search child case-insensitive (UE assumes case-insensitive file systems).
//     const children = await file.children();
//     const child = children.find((child) => child.name.toLowerCase() === string.toLowerCase());
//     if (!child) {
//       return null;
//     }
//     file = child;
//   }
//
//   return file;
// }
//
// async function resolveVirtualFile(virtualPath: string, gameDirectory: FileApi): Promise<FileApi | null> {
//   invariant(gameDirectory.kind === "directory");
//   invariant(virtualPath.startsWith("/"));
//
//   const parts = virtualPath.slice(1).split("/");
//
//   if (parts.length > 0 && parts[0].toLowerCase() === "game") {
//     const path = `Content/${parts.slice(1).join("/")}}`;
//     return resolvePath(gameDirectory, path);
//   }
//
//   return null;
// }

async function readAndParseFile(file: FileApi) {
  const content = await file.read();
  // TODO: the name should be the virtual path of the file
  return openAssetFromDataView(MakeObjectContext(), `/Game/${file.name}`, new DataView(content));
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

export function FileViewer(props: { file: FileApi }) {
  invariant(props.file.kind === "file", "Expected a file");
  const [tabIndex, setTabIndex] = useState(getTabIndexFromHash);

  const [asset, setAsset] = React.useState<AssetApi>();

  useEffect(() => {
    setAsset(undefined);
    readAndParseFile(props.file)
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
