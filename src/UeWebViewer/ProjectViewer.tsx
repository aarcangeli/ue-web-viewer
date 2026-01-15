import { type FileApi } from "../unreal-engine/fileSystem/FileApi";
import { Center, Flex, Spinner, useColorModeValue } from "@chakra-ui/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import type { MinimalNode, TreeViewApi } from "./components/TreeView";
import { TreeView } from "./components/TreeView";
import { fakeWait } from "./config";
import { FileViewer } from "./viewer/FileViewer";
import { BiFileBlank, BiFolder } from "react-icons/bi";
import { navigate, useHistoryState } from "./utils/useHistoryState";
import { ProjectApi, ProjectApiProvider } from "./ProjectApi";
import { useAsyncCompute } from "../utils/async-compute";
import { createContainer } from "../unreal-engine/container";
import { setGlobalContainer } from "../unreal-engine/global-container";

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

function useGlobalContainer(root: FileApi) {
  return useAsyncCompute(
    async (aborted) => {
      const container = createContainer();
      await container.vfs.mapGameDirectory(root, aborted);
      setGlobalContainer(container);
      return container;
    },
    [root],
  );
}

export function ProjectViewer(props: { project: FileApi }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // TODO: avoid re-rendering the whole viewer when the file changes
  const [currentFile, setCurrentFile] = useState<FileApi | null>(null);
  const tree = useRef<TreeViewApi>(null);

  const { data: container, error } = useGlobalContainer(props.project);

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

  useHistoryState(Boolean(container), onChoosePath);

  const onSelect = useCallback((nodes: FileNode[], isUserAction: boolean) => {
    if (nodes.length === 1) {
      if (isUserAction) {
        navigate(nodes[0].file.fullPath);
      }
      setCurrentFile(nodes[0].file);
    } else {
      setCurrentFile(null);
    }
  }, []);

  if (error) {
    return (
      <Center flexGrow={1}>
        <div>Error: {String(error)}</div>
      </Center>
    );
  }

  if (!container) {
    return (
      <Center flexGrow={1}>
        <Spinner />
      </Center>
    );
  }

  return (
    <ProjectApiProvider value={projectApi}>
      <Flex className={"project-viewer"} flex={1}>
        <Flex direction={"column"} w={"400px"} borderRight="1px" borderColor={borderColor} p={2} gap={1}>
          <TreeView<FileNode> ref={tree} rootNodes={nodes} loadChildren={loadChildNodes} onSelect={onSelect} />
        </Flex>
        <Flex direction={"column"} grow={1} shrink={1}>
          {currentFile && currentFile.kind === "file" && (
            <FileViewer file={currentFile} container={container}></FileViewer>
          )}
        </Flex>
      </Flex>
    </ProjectApiProvider>
  );
}
