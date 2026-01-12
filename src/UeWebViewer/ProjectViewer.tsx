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
import { VirtualFileSystem } from "../unreal-engine/fileSystem/VirtualFileSystem";

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

function useOpenVFS(root: FileApi) {
  return useAsyncCompute(
    async (aborted) => {
      const vfs = new VirtualFileSystem();
      await vfs.mapGameDirectory(root, aborted);
      return vfs;
    },
    [root],
  );
}

export function ProjectViewer(props: { project: FileApi }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // TODO: avoid re-rendering the whole viewer when the file changes
  const [currentFile, setCurrentFile] = useState<FileApi | null>(null);
  const tree = useRef<TreeViewApi<FileNode>>(null);

  const { data: vfs } = useOpenVFS(props.project);

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

  useHistoryState(Boolean(vfs), onChoosePath);

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

  if (!vfs) {
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
          {currentFile && currentFile.kind === "file" && <FileViewer file={currentFile} vfs={vfs}></FileViewer>}
        </Flex>
      </Flex>
    </ProjectApiProvider>
  );
}
