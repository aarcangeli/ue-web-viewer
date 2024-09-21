import { NodeApi, NodeRendererProps, Tree, TreeApi } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useMemo, useRef } from "react";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { searchCtx, SpeedSearch } from "./SpeedSearch";
import { PatternQuery } from "../../utils/PatternQuery";

const LINE_HEIGHT = 32;
const GAP = 1;

export interface MinimalNode {
  name: string;
  icon?: React.ReactNode;
  iconColor?: string;
  isLeaf?: boolean;
  isEmpty?: boolean;
}

export interface TreeViewApi<T> {
  selectPath(path: string): Promise<boolean>;
  clearSelection(): void;
}

interface Props<T extends MinimalNode> {
  nodes: T[];
  loadChildren: (node: T) => Promise<T[]>;
  onSelect?: (nodes: T[], isUserAction: boolean) => void;
}

interface Node<T extends MinimalNode> {
  id: string;
  value: T;
  children?: Node<T>[];
  currentLoading?: Promise<void>;
  isLoaded?: boolean;
}

// Big number, so when a scroll is performed quickly, the tree doesn't flicker
const OVERSCAN_COUNT = 20;

/**
 * This tree-view manages the scroll and resize of the component.
 */
function TreeViewFn<T extends MinimalNode>(props: Props<T>, ref: React.Ref<TreeViewApi<T> | undefined>) {
  const { ref: treeViewRoot, height } = useResizeObserver();
  const [version, setVersion] = React.useState(0);
  const nextId = React.useRef(0);
  const treeRef = useRef<TreeApi<Node<T>> | null>(null);
  const isUserAction = useRef(true);

  const loadChildren = props.loadChildren;
  const nodes = props.nodes;

  const generateId = useCallback(() => {
    return String(nextId.current++);
  }, []);

  const loadAndProcessChildren = useCallback(
    async (node: T): Promise<Node<T>[]> => {
      const children = await loadChildren(node);
      return children.map((child) => {
        return {
          id: generateId(),
          value: child,
          children: child.isLeaf ? undefined : [],
          isLoaded: false,
        } as Node<T>;
      });
    },
    [generateId, loadChildren],
  );

  const loadChildrenIfRequired = useCallback(
    (node: Node<T>) => {
      if (node.isLoaded || node.currentLoading) {
        // Already loaded or loading
        return node.currentLoading;
      }

      let promise = loadAndProcessChildren(node.value)
        .then((children) => {
          if (promise === node.currentLoading) {
            // If the new list is empty, select the parent node
            if (node.children?.length === 1) {
              const loadingMockId = node.children[0].id;
              if (children.length == 0) {
                // select the parent node, so that the user doesn't lose the selection
                if (treeRef.current?.isSelected(loadingMockId)) {
                  treeRef.current?.select(node.id);
                }
              }
            }
            node.children = children.length !== 0 ? children : undefined;
            node.isLoaded = true;
            node.currentLoading = undefined;
            setVersion((v) => v + 1);
          }
        })
        .catch((e) => {
          if (promise === node.currentLoading) {
            console.error("Error loading children", e);
            node.currentLoading = undefined;
          }
        });

      node.currentLoading = promise;

      // Use a fake loading node
      node.children = [
        {
          id: generateId(),
          value: { name: "Loading...", isEmpty: true } as T,
          isLoaded: false,
        },
      ];

      return promise;
    },
    [generateId, loadAndProcessChildren],
  );

  const convertedNodes = useMemo<Node<T>[]>(() => {
    return nodes.map((node) => {
      return {
        id: generateId(),
        children: node.isLeaf ? undefined : [],
        value: node,
      } as Node<T>;
    });
  }, [generateId, nodes]);

  const selectWithoutUserAction = useCallback((id: string) => {
    isUserAction.current = false;
    try {
      treeRef.current?.select(id);
    } finally {
      isUserAction.current = true;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    async selectPath(path: string) {
      let nodeList = convertedNodes;
      let foundElement: Node<T> | null = null;
      for (let part of path.split("/")) {
        if (foundElement) {
          treeRef.current?.open(foundElement.id);
        }
        const content = nodeList.find((child) => child.value.name === part);
        if (!content) {
          return false;
        }
        await loadChildrenIfRequired(content);
        foundElement = content;
        nodeList = content.children || [];
      }
      if (foundElement) {
        selectWithoutUserAction(foundElement.id);
        return true;
      }
      return false;
    },
    clearSelection() {
      treeRef.current?.deselectAll();
    },
  }));

  // Everytime the version changes, force the tree to re-render
  // This is the only way to force the tree to re-render
  const data = useMemo(() => [...convertedNodes], [convertedNodes, version]);

  const onToggle = useCallback(
    (id: string) => {
      const node = treeRef.current?.get(id);
      if (node && node.isOpen) {
        loadChildrenIfRequired(node.data);
      }
    },
    [loadChildrenIfRequired],
  );

  const propsOnSelect = props.onSelect;
  const onSelect = useCallback(
    (nodes: NodeApi<Node<T>>[]) => {
      const selectedNodes = nodes.map((n) => n.data.value);
      propsOnSelect?.(selectedNodes || [], isUserAction.current);
    },
    [propsOnSelect],
  );

  const doFind = useCallback((query: PatternQuery, direction: null | "up" | "down") => {
    let tree = treeRef.current;
    if (!tree) return;

    const visibleNodes = tree.visibleNodes;
    const selectedNodes = tree.selectedNodes;
    const currentSelection = selectedNodes.length > 0 ? selectedNodes[0] : null;
    const selectionIndex = currentSelection ? visibleNodes.indexOf(currentSelection) : -1;

    let start;
    switch (direction) {
      case null:
        start = selectionIndex >= 0 ? selectionIndex : 0;
        break;
      case "up":
        start = Math.max(0, selectionIndex - 1);
        break;
      case "down":
        start = Math.min(visibleNodes.length - 1, selectionIndex + 1);
        break;
    }

    const delta = direction === "up" ? -1 : 1;
    for (let i = start; i >= 0 && i < visibleNodes.length; i += delta) {
      if (query.match(visibleNodes[i].data.value.name)) {
        tree.select(visibleNodes[i].id, { focus: false });
        return;
      }
    }

    // If nothing found, search to the opposite direction
    if (direction === null) {
      doFind(query, "up");
    }
  }, []);

  return (
    <div
      ref={treeViewRoot}
      style={{ flexGrow: 1, userSelect: "none", position: "relative" }}
      className="treeview-root"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
        }
      }}
    >
      <SpeedSearch
        onNavigate={doFind}
        onSearch={(value) => doFind(value, null)}
        onHide={() => {
          let nodes = treeRef.current?.selectedNodes;
          if (nodes && nodes?.length > 0) {
            treeRef.current?.focus(nodes[0].id);
          } else {
            treeRef.current?.listEl.current?.focus();
          }
        }}
      >
        <Tree<Node<T>>
          ref={treeRef}
          height={height}
          width={"100%"}
          data={data}
          rowHeight={LINE_HEIGHT + GAP}
          disableEdit={true}
          disableDrag={true}
          disableDrop={true}
          selectionFollowsFocus={true}
          openByDefault={false}
          onToggle={onToggle}
          onSelect={onSelect}
          overscanCount={OVERSCAN_COUNT}
        >
          {NodeView}
        </Tree>
      </SpeedSearch>
    </div>
  );
}

/**
 * Display a single row of the tree.
 */
function NodeView<T extends MinimalNode>(props: NodeRendererProps<Node<T>>) {
  const node = props.node;
  const isSelected = node.isSelected;
  const isExpanded = node.isOpen;
  const isPrevSelected = isSelected && node.prev?.isSelected;
  const isNextSelected = isSelected && node.next?.isSelected;
  const value = node.data.value;

  const isEmptyFolder = node.isLeaf || value.isEmpty;

  const query = useContext(searchCtx);

  return (
    <Box mx={1} ref={props.dragHandle} pb={`${GAP}px`} display={"flex"} flexDirection={"row"}>
      <Box
        display={"inline-flex"}
        flexDirection={"row"}
        flexGrow={1}
        justifyContent={"left"}
        alignItems={"center"}
        borderTopRadius={isPrevSelected ? undefined : "md"}
        borderBottomRadius={isNextSelected ? undefined : "md"}
        color={"gray.300"}
        px={2}
        fontSize={13}
        cursor={"pointer"}
        bg={isSelected ? "gray.700" : "transparent"}
        _hover={{ bg: isSelected ? "gray.600" : "gray.700", color: "white" }}
        height={`${LINE_HEIGHT}px`}
        style={props.style}
        whiteSpace={"nowrap"}
      >
        {isEmptyFolder && <Box w={"24px"} h={"24px"} flexShrink={0} />}
        {!isEmptyFolder && (
          <IconButton
            isRound
            size="xs"
            variant="link"
            colorScheme="blue"
            aria-label="Expand"
            verticalAlign={"baseline"}
            onClick={(event) => {
              event.stopPropagation();
              node.toggle();
            }}
            fontSize="24px"
            icon={isExpanded ? <BiChevronDown /> : <BiChevronRight />}
          />
        )}

        <Box
          flexShrink={0}
          w={"20px"}
          h={"20px"}
          fontSize="20px"
          verticalAlign={"baseline"}
          mr={2}
          color={value.iconColor}
        >
          {value.icon}
        </Box>
        <Text flexGrow={1} fontWeight={isSelected ? "bold" : "normal"} alignSelf={"center"}>
          {!query && value.name}
          {query && <HighlightedText text={value.name} query={query} isSelected={isSelected} />}
        </Text>
      </Box>
    </Box>
  );
}

function HighlightedText(props: { text: string; query: PatternQuery; isSelected: boolean }) {
  const text = props.text;
  const isSelected = props.isSelected;

  return (
    <>
      {props.query.splitParts(text).map((part, index) => (
        <span
          key={index}
          style={
            index % 2 === 1
              ? { backgroundColor: isSelected ? "orange" : "yellow", color: "black", borderRadius: "2px" }
              : {}
          }
        >
          {part}
        </span>
      ))}
    </>
  );
}

export const TreeView = memo(forwardRef(TreeViewFn)) as <T extends MinimalNode>(
  props: Props<T> & { ref?: React.ForwardedRef<TreeViewApi<T> | undefined> },
) => ReturnType<typeof TreeViewFn>;
