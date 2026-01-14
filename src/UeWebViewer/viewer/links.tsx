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
  const object = props.objectPtr;

  const value = useAsyncCompute((abort) => object.load(abort), [object]);

  if (object.isNull()) {
    return <i>null</i>;
  }
  if (!value.isLoading && !value.error && !value.data) {
    return <Box color={"red"}>Missing object: {object.toString()}</Box>;
  }
  return (
    <Link href="#" display={"inline-flex"} alignItems={"center"} gap={1}>
      <span>{object.getSoftObjectPath().toString()}</span>
      {value.isLoading ? <Spinner size={"xs"} /> : <LuSearch />}
    </Link>
  );
}

// TODO: make it coherent with renderObjectPtr
export function renderObjectName(object: UObject | null): ReactNode {
  return object ? object.fullName : "null";
}
