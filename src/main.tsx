import React from "react";
import ReactDOM from "react-dom/client";
import App from "./UeWebViewer/App";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
