import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
});
