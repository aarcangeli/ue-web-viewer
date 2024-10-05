import type { FileApi } from "./filesystem/FileApi";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import type { MinimalNode, TreeViewApi } from "./components/TreeView";
import { TreeView } from "./components/TreeView";
import { fakeWait } from "./config";
import { FileViewer } from "./viewer/FileViewer";
import { BiFileBlank, BiFolder } from "react-icons/bi";
import { navigate, useHistoryState } from "../utils/useHistoryState";
import { ProjectApi, ProjectApiProvider } from "./ProjectApi";

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
  const files = await node.file.children();
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

  const project = props.project;

  const nodes = useMemo(() => [makeNode(project)], [project]);
  const projectApi = useMemo(() => new ProjectApi(project.name), [project]);

  const onChoosePath = useCallback((path: string | undefined) => {
    if (path) {
      tree.current?.selectPath(path);
    } else {
      setCurrentFile(null);
      tree.current?.clearSelection();
    }
  }, []);

  useHistoryState(onChoosePath);

  const onSelect = useCallback((node: FileNode[], isUserAction: boolean) => {
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
    <ProjectApiProvider value={projectApi}>
      <Flex className={"project-viewer"} flex={1}>
        <Flex direction={"column"} w={"400px"} borderRight="1px" borderColor={borderColor} p={2} gap={1}>
          <TreeView<FileNode> ref={tree} nodes={nodes} loadChildren={loadChildNodes} onSelect={onSelect} />
        </Flex>
        <Flex direction={"column"} grow={1} shrink={1}>
          {currentFile && currentFile.kind === "file" && <FileViewer file={currentFile}></FileViewer>}
        </Flex>
      </Flex>
    </ProjectApiProvider>
  );
}
