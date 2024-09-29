import { Box, Flex, HTMLChakraProps, IconButton, Text } from "@chakra-ui/react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import React, { useCallback, useContext, useState } from "react";
import * as CSS from "csstype";

const INDENT_SIZE = 18;
const LINE_HEIGHT = 26;

interface Props {
  children?: React.ReactNode;
}

interface SimpleDetailsViewCtx {
  indent: number;
}

const DetailsViewContext = React.createContext<SimpleDetailsViewCtx | null>(null);

function OptionalTreeHandle(props: { isVisible?: boolean; isExpanded: boolean; onClick?: () => void }) {
  if (!props.isVisible) {
    return <Box w={"24px"} h={"24px"} flexShrink={0} />;
  }

  return (
    <IconButton
      isRound
      size="xs"
      variant="link"
      colorScheme="blue"
      aria-label="Expand"
      verticalAlign={"baseline"}
      onClick={(event) => {
        event.stopPropagation();
        props.onClick?.();
      }}
      fontSize="24px"
      icon={props.isExpanded ? <BiChevronDown /> : <BiChevronRight />}
    />
  );
}

export function SimpleDetailsView(props: Props) {
  const viewContext = { indent: 0 };

  return (
    <Flex direction={"column"} fontSize={13} gap={"1px"} bg={"black"}>
      <DetailsViewContext.Provider value={viewContext}>{props.children}</DetailsViewContext.Provider>
    </Flex>
  );
}

function useViewContext() {
  const viewContext = useContext(DetailsViewContext);
  if (!viewContext) {
    throw new Error("CollapsableSection must be used inside SimpleDetailsView");
  }
  return viewContext;
}

function useViewContextCopy() {
  const viewContext = useContext(DetailsViewContext);
  if (!viewContext) {
    throw new Error("CollapsableSection must be used inside SimpleDetailsView");
  }
  return { ...viewContext };
}

export function IndentedRow(
  props: HTMLChakraProps<"div"> & { title?: string; withPlaceHolder?: boolean; bgHover?: CSS.Property.Color },
) {
  const viewContext = useViewContext();
  const { children, title, withPlaceHolder, bg, bgHover, ...rest } = props;

  return (
    <Flex
      direction={"row"}
      alignItems={"center"}
      minH={`${LINE_HEIGHT}px`}
      bg={bg ?? "gray.900"}
      _hover={{ bg: bgHover ?? "gray.800" }}
      {...rest}
    >
      {Array.from({ length: viewContext.indent }, (_, i) => (
        <Box
          key={i}
          w={`${INDENT_SIZE}px`}
          alignSelf={"stretch"}
          flexShrink={0}
          bgGradient="linear(to-r, gray.800, gray.700)"
          borderRight={"1px solid"}
          borderColor={"black"}
        />
      ))}
      {(withPlaceHolder ?? true) && <Box w={`24px`} h={`24px`} flexShrink={0} />}
      {title && (
        <Text as={"span"} color={"orange.300"} mr={2}>
          {title}:
        </Text>
      )}
      {props.children}
    </Flex>
  );
}

export function CollapsableSection(props: {
  name: React.ReactNode;
  children?: React.ReactNode;
  initialExpanded?: boolean;
  hasChildren?: boolean;
}) {
  const hasChildren = props.hasChildren ?? true;

  const [isExpanded, setIsExpanded] = useState(props.initialExpanded ?? true);
  const onClick = useCallback(() => setIsExpanded((e) => !e), []);

  const viewContext = useViewContextCopy();
  const originalIndent = viewContext.indent;

  viewContext.indent += 1;

  return (
    <Flex direction={"column"} gap={"1px"}>
      <IndentedRow
        bg={originalIndent === 0 ? "gray.700" : undefined}
        bgHover={originalIndent === 0 ? "gray.700" : undefined}
        withPlaceHolder={false}
      >
        <OptionalTreeHandle isVisible={hasChildren} isExpanded={isExpanded} onClick={onClick} />
        <Text cursor={"default"}>{props.name}</Text>
      </IndentedRow>
      {isExpanded && <DetailsViewContext.Provider value={viewContext}>{props.children}</DetailsViewContext.Provider>}
    </Flex>
  );
}
