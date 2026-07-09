import { Box, Container, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Layout for public, unauthenticated pages (the homepage). It intentionally has
// no sidebar: navigation is limited to Sign in / Get Started in the navbar. The
// full app sidebar only appears once the user signs in and enters the app shell.
const PublicLayout = () => {
  const bgColor = useColorModeValue("gray.950", "gray.900");
  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Box
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
    </Box>
  );
};

export default PublicLayout;
