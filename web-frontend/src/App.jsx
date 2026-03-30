import { Box, Container, Flex, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Analytics from "./pages/analytics/Analytics";
import Dashboard from "./pages/dashboard/Dashboard";
import CreatePool from "./pages/pools/CreatePool";
import Pools from "./pages/pools/Pools";
import Settings from "./pages/settings/Settings";
import Synthetics from "./pages/synthetics/Synthetics";

function App() {
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.950", "gray.900")}>
      <Navbar />
      <Flex>
        <Box
          display={{ base: "none", md: "block" }}
          w="60"
          position="fixed"
          h="calc(100vh - 60px)"
          top="60px"
        >
          <Sidebar />
        </Box>
        <Box ml={{ base: 0, md: 60 }} p="4" w="full" mt="60px">
          <Container maxW="container.xl" py={8}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pools" element={<Pools />} />
              <Route path="/pools/create" element={<CreatePool />} />
              <Route path="/synthetics" element={<Synthetics />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
