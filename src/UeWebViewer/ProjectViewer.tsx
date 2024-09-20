import { FileApi } from "./filesystem/FileApi";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { MinimalNode, TreeView, TreeViewApi } from "./components/TreeView";
import { fakeWait } from "./config";
import { FileViewer } from "./viewer/FileViewer";
import { BiFileBlank, BiFolder } from "react-icons/bi";
import { useHistoryState, useNavigate } from "./utils/useHistoryState";

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
  const tree = useRef<TreeViewApi<FileNode>>(null);

  const nodes = useMemo(() => [makeNode(props.project)], [props.project]);

  let onChoosePath = useCallback((path: string | undefined) => {
    if (path) {
      console.log("path", path, tree);
      tree.current?.selectPath(path);
    } else {
      console.log("Navigating to blank path");
      setCurrentFile(null);
      tree.current?.clearSelection();
    }
  }, []);

  useHistoryState(onChoosePath);

  const navigate = useNavigate();

  const onSelect = useCallback((node: FileNode[], isUserAction: boolean) => {
    // navigate("/nuova-pagina");
    if (node.length === 1) {
      if (isUserAction) {
        navigate(node[0].file.fullPath);
      }
      setCurrentFile(node[0].file);
    } else {
      setCurrentFile(null);
    }
  }, []);

  return (
    <Flex className={"project-viewer"} flex={1}>
      <Flex direction={"column"} w={"400px"} borderRight="1px" borderColor={borderColor} p={2} gap={1}>
        <TreeView<FileNode> ref={tree} nodes={nodes} loadChildren={loadChildNodes} onSelect={onSelect} />
      </Flex>
      <Flex direction={"column"} grow={1} shrink={1}>
        {currentFile && currentFile.kind === "file" && <FileViewer file={currentFile}></FileViewer>}
      </Flex>
    </Flex>
  );
}
