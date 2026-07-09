import { Box, Container, Flex, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// The main application chrome: fixed navbar, fixed sidebar (desktop) and a
// scrollable content area. Auth pages render outside this shell so they can use
// the full viewport.
const AppShell = () => {
  const bgColor = useColorModeValue("gray.950", "gray.900");
  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Flex>
        <Box
          display={{ base: "none", md: "block" }}
          w="60"
          position="fixed"
          h="calc(100vh - 60px)"
          top="60px"
          zIndex={100}
        >
          <Sidebar />
        </Box>

        <Box
          ml={{ base: 0, md: 60 }}
          w="full"
          mt="60px"
          minH="calc(100vh - 60px)"
          display="flex"
          flexDirection="column"
        >
          <Container maxW="container.xl" py={8} flex="1">
            <Outlet />
          </Container>
          <Footer />
        </Box>
      </Flex>
    </Box>
  );
};

export default AppShell;
