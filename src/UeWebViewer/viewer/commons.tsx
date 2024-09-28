import { IconButton, Link, Text, Tooltip } from "@chakra-ui/react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import React from "react";
import { FName } from "../../unreal-engine/structs/Name";

/**
 * Just a utility method to render an object title which is common to both import and export details.
 * TODO: class may be clickable to open the asset.
 */
export function makeObjectTitle(args: { onClick?: () => void; objectName: FName; objectClass: string }) {
  const objectName = args.objectName.text;

  return (
    <>
      {args.onClick ? (
        <>
          <Link onClick={args.onClick}>{objectName}</Link>
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
        <Text as={"span"}>{objectName}</Text>
      )}{" "}
      <Text as={"span"} color={"gray.500"}>
        {"{"}
        {args.objectClass}
        {"}"}
      </Text>
    </>
  );
}
