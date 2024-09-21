import { IconButton, Link, Text, Tooltip } from "@chakra-ui/react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import React from "react";

/**
 * Just a utility method to render an object title which is common to both import and export details.
 * TODO: class may be clickable to open the asset.
 */
export function makeObjectTitle(args: { onClick?: () => void; objectName: string; objectClass: string }) {
  return (
    <>
      {args.onClick ? (
        <>
          <Link onClick={args.onClick}>{args.objectName}</Link>
          <Tooltip label="Open asset" aria-label="Open asset" placement={"top"}>
            <IconButton
              onClick={args.onClick}
              aria-label={"Open asset"}
              variant={"ghost"}
              size={"xs"}
              icon={<HiMagnifyingGlass />}
            />
          </Tooltip>
        </>
      ) : (
        <Text as={"span"}>{args.objectName}</Text>
      )}{" "}
      <Text as={"span"} color={"gray.500"}>
        {"{"}
        {args.objectClass}
        {"}"}
      </Text>
    </>
  );
}
