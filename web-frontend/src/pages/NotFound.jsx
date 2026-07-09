import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => (
  <VStack spacing={6} py={20} textAlign="center">
    <Heading
      fontSize="8xl"
      bgGradient="linear(to-r, brand.400, accent.400)"
      bgClip="text"
    >
      404
    </Heading>
    <Box>
      <Heading size="lg" mb={2}>
        Page not found
      </Heading>
      <Text color="gray.400" maxW="420px">
        The page you are looking for does not exist or may have been moved.
      </Text>
    </Box>
    <Button
      as={RouterLink}
      to="/"
      leftIcon={<FiArrowLeft />}
      colorScheme="brand"
      bgGradient="linear(to-r, brand.500, accent.500)"
      _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
    >
      Back to home
    </Button>
  </VStack>
);

export default NotFound;
