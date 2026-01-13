import React from "react";
import { ProjectViewer } from "./ProjectViewer";
import { getFilesFromItems } from "./filesystem/utils";
import { fakeWait } from "./config";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Flex,
  Spinner,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import DropArea from "./components/DropArea";
import "./App.css";
import { NavBar } from "./components/NavBar";

/**
 * Preliminary function to check if the project is valid
 * @param items
 */
async function OpenItems(items: DataTransferItem[]): Promise<React.ReactNode> {
  // This must be before any await, otherwise the browser will not convert the items to files correctly
  const handles = await getFilesFromItems(items);

  // Fake loading
  await fakeWait();

  if (handles.length !== 1 || handles[0].kind !== "directory") {
    throw new Error("Expected a directory with a single uproject file");
  }

  const project = (await handles[0].children()).filter((file) => file.name.endsWith(".uproject"));
  if (!project.length) {
    throw new Error("No uproject file found");
  }
  if (project.length !== 1) {
    throw new Error("Multiple uproject files found");
  }

  return <ProjectViewer project={handles[0]} />;
}

function App() {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [version, setVersion] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentContent, setCurrentContent] = React.useState<React.ReactNode>(null);

  async function DoOpenProject(items: DataTransferItem[]) {
    setVersion(version + 1);
    setLoading(true);
    setCurrentContent(null);
    try {
      setCurrentContent(await OpenItems(items));
      setError(null);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex className={"app"} direction={"column"} h={"100vh"} bg={useColorModeValue("white", "gray.900")}>
      <DropArea onFileDrop={DoOpenProject}>Drop a project here</DropArea>

      <Flex as={"header"} borderBottom="1px" borderColor={borderColor} h={16}>
        <NavBar />
      </Flex>

      {error && (
        <Box padding={2}>
          <Alert status="error" variant="subtle" alignItems="center" justifyContent="center" height="200px">
            <VStack flexGrow={1}>
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Application error!
              </AlertTitle>
              <AlertDescription maxWidth="sm">{error}</AlertDescription>
            </VStack>
            <CloseButton alignSelf="start" position="relative" right={-1} top={-1} onClick={() => setError(null)} />
          </Alert>
        </Box>
      )}

      {loading && (
        <Flex position={"absolute"} top={0} left={0} w={"100%"} h={"100%"} bg={"rgba(0, 0, 0, 0.5)"} zIndex={1000}>
          <Flex m={"auto"}>
            <Spinner />
          </Flex>
        </Flex>
      )}

      <Flex flex={1} minHeight={0}>
        {!error && !loading && !currentContent && (
          <Box p={10} flexGrow={1}>
            Drop a directory containing a .uproject
          </Box>
        )}

        {currentContent}
      </Flex>
    </Flex>
  );
}

export default App;
