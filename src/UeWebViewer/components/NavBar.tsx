import { Box, Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export const NavLink = (props: { children: React.ReactNode; onClick?: () => void; href?: string }) => {
  const { children } = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
      href={props.href ?? "javascript:void(0)"}
      onClick={props.onClick}
    >
      {children}
    </Box>
  );
};

export function NavBar() {
  return (
    <Box flexGrow={1} bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <HStack spacing={8} alignItems={"center"}>
          <Box>UE Web Viewer</Box>
          {/*<HStack as={"nav"} spacing={4}><NavLink href={"/"}>Dashboard</NavLink></HStack>*/}
        </HStack>
      </Flex>
    </Box>
  );
}
