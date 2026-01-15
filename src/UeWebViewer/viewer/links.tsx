import type { UObject } from "../../unreal-engine/modules/CoreUObject/objects/Object";
import React, { type ReactNode } from "react";
import { Box, Link, Spinner } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import type { ObjectPtr } from "../../unreal-engine/modules/CoreUObject/structs/ObjectPtr";
import { useAsyncCompute } from "../../utils/async-compute";

/**
 * Render a reference to an object.
 */
export function LinkObjectPtr(props: { objectPtr: ObjectPtr }): ReactNode {
  const objectPtr = props.objectPtr;

  const value = useAsyncCompute((abort) => objectPtr.load(abort), [objectPtr]);

  if (objectPtr.isNull()) {
    return <i>null</i>;
  }
  if (!value.isLoading && !value.error && !value.data) {
    return <Box color={"red"}>Missing object: {objectPtr.toString()}</Box>;
  }
  return (
    <Link display={"inline-flex"} alignItems={"center"} gap={1}>
      <span>{objectPtr.getSoftObjectPath().toString()}</span>
      {value.isLoading ? <Spinner size={"xs"} /> : <LuSearch />}
    </Link>
  );
}

// TODO: make it coherent with renderObjectPtr
export function renderObjectName(object: UObject | null): ReactNode {
  return object ? object.fullName : "null";
}
