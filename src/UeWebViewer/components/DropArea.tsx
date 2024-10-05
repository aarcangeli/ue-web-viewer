import { Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function DropArea(props: {
  children?: ReactNode | undefined;
  onFileDrop?: (items: DataTransferItem[]) => void;
}) {
  const dropTargetsRef = useRef<HTMLDivElement>(null);
  const inputFile = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const isDragActiveRef = useRef(isDragActive);
  const dragTargetsRef = useRef<Element[]>([]);

  const onDragEnter = useCallback((event: DragEvent) => {
    const items = event.dataTransfer?.items;
    let foundFile = false;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          foundFile = true;
          break;
        }
      }
    }
    if (!foundFile) {
      return;
    }
    event.preventDefault();
    dragTargetsRef.current.push(event.target as Element);
    isDragActiveRef.current = true;
    setIsDragActive(true);
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    try {
      if (event.dataTransfer && isDragActiveRef.current) {
        event.dataTransfer.dropEffect = "link";
      }
    } catch (e) {
      console.warn("Failed to set dropEffect", e);
    }
    event.preventDefault();
  }, []);

  const onDragLeave = useCallback((event: DragEvent) => {
    dragTargetsRef.current = dragTargetsRef.current.filter((target) => target !== event.target);
    if (dragTargetsRef.current.length === 0) {
      setIsDragActive(false);
      isDragActiveRef.current = false;
    }
  }, []);

  const onFileDrop = props.onFileDrop;
  const onDrop = useCallback(
    (event: DragEvent) => {
      if (!event.dataTransfer || !isDragActiveRef.current) {
        return;
      }
      event.preventDefault();
      if (onFileDrop) {
        onFileDrop(Array.from(event.dataTransfer.items));
      }
      setIsDragActive(false);
      isDragActiveRef.current = false;
    },
    [onFileDrop],
  );

  // Bind events on the window
  useEffect(() => {
    if (window) {
      window.addEventListener("dragenter", onDragEnter);
      window.addEventListener("dragover", onDragOver);
      window.addEventListener("dragleave", onDragLeave);
      window.addEventListener("drop", onDrop);
    }
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  });

  if (!isDragActive) {
    return <></>;
  }

  return (
    <Flex
      position={"fixed"}
      top={0}
      left={0}
      right={0}
      bottom={0}
      my={4}
      zIndex={10}
      padding={5}
      bg={"rgba(0, 0, 0, 0.5)"}
    >
      <input ref={inputFile} type="file" name="file" style={{ display: "none" }}></input>
      <Flex
        flexGrow={1}
        ref={dropTargetsRef}
        p={6}
        borderWidth={2}
        borderColor={isDragActive ? "blue.500" : "gray.500"}
        backgroundColor={isDragActive ? "blue.900" : "gray.900"}
        borderStyle="dashed"
        borderRadius="xl"
        alignItems={"center"}
        justify={"center"}
      >
        {props.children}
      </Flex>
    </Flex>
  );
}
