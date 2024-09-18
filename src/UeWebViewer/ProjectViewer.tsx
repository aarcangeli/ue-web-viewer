import { FileApi } from "./filesystem/FileApi";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import React, { useCallback, useMemo, useState } from "react";
import { MinimalNode, TreeView } from "./components/TreeView";
import { fakeWait } from "./config";
import { FileViewer } from "./FileViewer";
import { BiFileBlank, BiFolder } from "react-icons/bi";

export interface Props {
  project: FileApi;
}

interface FileNode extends MinimalNode {
  file: FileApi;
  name: string;
  isLeaf: boolean;
  isEmpty?: boolean;
}

function makeNode(node: FileApi): FileNode {
  return {
    file: node,
    name: node.name,
    isLeaf: node.kind === "file",
    isEmpty: node.kind === "directory" && node.isEmptyDirectory(),
    icon: node.kind === "directory" ? <BiFolder /> : <BiFileBlank />,
  };
}

async function loadChildNodes(node: FileNode): Promise<FileNode[]> {
  await fakeWait();
  let files = await node.file.children();
  files.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  return files.map(makeNode);
}

export function ProjectViewer(props: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // TODO: avoid re-rendering the whole viewer when the file changes
  const [currentFile, setCurrentFile] = useState<FileApi | null>(null);

  const nodes = useMemo(() => [makeNode(props.project)], [props.project]);

  const onSelect = useCallback((node: FileNode[]) => {
    if (node.length === 1) {
      setCurrentFile(node[0].file);
    } else {
      setCurrentFile(null);
    }
  }, []);

  return (
    <Flex grow={1} basis={0} shrink={1}>
      <Flex direction={"column"} w={"400px"} borderRight="1px" borderColor={borderColor} p={2} gap={1} shrink={0}>
        <TreeView<FileNode> nodes={nodes} loadChildren={loadChildNodes} onSelect={onSelect} />
      </Flex>
      <Flex direction={"column"} grow={1} shrink={1}>
        {currentFile && currentFile.kind === "file" && <FileViewer file={currentFile}></FileViewer>}
      </Flex>
    </Flex>
  );
}
