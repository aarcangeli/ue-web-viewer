import { FAsset } from "../../unreal-engine/Asset";
import React from "react";
import { Box } from "@chakra-ui/react";

export function AssetPreview(props: { asset: FAsset }) {
  return (
    <Box display={"flex"} flexGrow={1} alignItems={"center"} justifyContent={"center"}>
      <Box border={"dashed"} borderWidth={4} borderColor={"gray.400"} p={10} borderRadius={10}>
        Asset Preview PlaceHolder
      </Box>
    </Box>
  );
}
