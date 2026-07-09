import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiBarChart2, FiShield, FiZap } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/images/fluxion-mark.svg";

const highlights = [
  {
    icon: FiZap,
    title: "Deep cross-chain liquidity",
    description: "Custom-weighted pools across 10+ EVM networks in one place.",
  },
  {
    icon: FiShield,
    title: "Non-custodial by design",
    description: "Your keys, your assets. Every action settles on-chain.",
  },
  {
    icon: FiBarChart2,
    title: "Institutional analytics",
    description: "Live APY, risk and volume metrics to guide every position.",
  },
];

// Full-screen split layout shared by every authentication page. The left brand
// panel is hidden on small screens so the form always gets full width.
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <Flex minH="100vh" bg="gray.950">
      {/* Brand / marketing panel */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        flex="1"
        direction="column"
        justify="space-between"
        p={12}
        position="relative"
        overflow="hidden"
        bgGradient="linear(160deg, gray.900 0%, gray.950 60%, #001a33 100%)"
        borderRight="1px solid"
        borderColor="gray.800"
      >
        <Box
          position="absolute"
          top="-100px"
          right="-60px"
          w="380px"
          h="380px"
          borderRadius="full"
          bg="brand.500"
          opacity="0.12"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-120px"
          left="-40px"
          w="320px"
          h="320px"
          borderRadius="full"
          bg="accent.500"
          opacity="0.1"
          filter="blur(60px)"
        />

        <Box as={RouterLink} to="/" zIndex={1}>
          <HStack spacing={3}>
            <Image src={logo} alt="Fluxion" h="9" />
            <Heading size="md" letterSpacing="tight">
              Fluxion
            </Heading>
          </HStack>
        </Box>

        <Box zIndex={1} maxW="440px">
          <Heading
            size="xl"
            lineHeight="1.2"
            mb={4}
            bgGradient="linear(to-r, white, gray.400)"
            bgClip="text"
          >
            The synthetic asset liquidity engine for modern DeFi.
          </Heading>
          <Text color="gray.400" mb={10} fontSize="lg">
            Mint, trade and provide liquidity for synthetic assets with
            zero-knowledge security across every major chain.
          </Text>

          <VStack align="stretch" spacing={5}>
            {highlights.map((item) => (
              <HStack key={item.title} spacing={4} align="start">
                <Flex
                  w="42px"
                  h="42px"
                  flexShrink={0}
                  borderRadius="lg"
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  align="center"
                  justify="center"
                >
                  <Icon as={item.icon} color="brand.300" boxSize={5} />
                </Flex>
                <Box>
                  <Text fontWeight="semibold">{item.title}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {item.description}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Text color="gray.600" fontSize="sm" zIndex={1}>
          © {new Date().getFullYear()} Fluxion Protocol. All rights reserved.
        </Text>
      </Flex>

      {/* Form panel */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        p={{ base: 6, md: 10 }}
        maxW={{ base: "100%", lg: "620px" }}
        mx="auto"
        w="full"
      >
        <Box w="full" maxW="420px">
          {/* Compact logo shown on small screens where the panel is hidden */}
          <Box
            display={{ base: "block", lg: "none" }}
            mb={8}
            textAlign="center"
          >
            <Image src={logo} alt="Fluxion" h="10" mx="auto" mb={2} />
            <Heading size="md">Fluxion</Heading>
          </Box>

          <Heading size="lg" mb={2}>
            {title}
          </Heading>
          {subtitle && (
            <Text color="gray.400" mb={8}>
              {subtitle}
            </Text>
          )}

          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
