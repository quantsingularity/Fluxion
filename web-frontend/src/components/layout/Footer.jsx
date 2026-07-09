import { Box, Flex, HStack, Link, Text } from "@chakra-ui/react";

const footerLinks = ["Terms", "Privacy", "Documentation"];

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="gray.900"
      borderTop="1px solid"
      borderColor="gray.700"
      py={4}
      px={6}
    >
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 0 }}
      >
        <Text fontSize="sm" color="gray.300">
          © {new Date().getFullYear()} Fluxion. All rights reserved.
        </Text>
        <HStack spacing={6}>
          {footerLinks.map((label) => (
            <Link
              key={label}
              fontSize="sm"
              color="gray.300"
              fontWeight="medium"
              _hover={{ color: "brand.300" }}
              href="#"
            >
              {label}
            </Link>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Footer;
