import { Box, Flex, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" bg="var(--color-surface)" py={4} px={6} mt="auto">
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 0 }}
      >
        <Text fontSize="sm" color="var(--color-text-secondary)">
          © {new Date().getFullYear()} Fluxion. All rights reserved.
        </Text>
        <Flex gap={4}>
          <Text fontSize="sm" color="var(--color-text-secondary)">
            <Box as="a" href="#" _hover={{ color: "var(--color-primary)" }}>
              Terms
            </Box>
          </Text>
          <Text fontSize="sm" color="var(--color-text-secondary)">
            <Box as="a" href="#" _hover={{ color: "var(--color-primary)" }}>
              Privacy
            </Box>
          </Text>
          <Text fontSize="sm" color="var(--color-text-secondary)">
            <Box as="a" href="#" _hover={{ color: "var(--color-primary)" }}>
              Documentation
            </Box>
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
