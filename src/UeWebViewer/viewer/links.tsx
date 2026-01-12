import type { UObject } from "../../unreal-engine/modules/CoreUObject/objects/Object";
import React, { type ReactNode } from "react";
import { Link } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import type { ObjectPtr } from "../../unreal-engine/modules/CoreUObject/structs/ObjectPtr";

/**
 * Render a reference to an object.
 */
export function renderObjectPtr(object: ObjectPtr): ReactNode {
  if (object.isNull()) {
    return <i>null</i>;
  }
  return (
    <Link href="#" display={"inline-flex"} alignItems={"center"} gap={1}>
      <span>{object.getSoftObjectPath().toString()}</span>
      <LuSearch />
    </Link>
  );
}

// TODO: make it coherent with renderObjectPtr
export function renderObjectName(object: UObject | null): ReactNode {
  return object ? object.fullName : "null";
}
