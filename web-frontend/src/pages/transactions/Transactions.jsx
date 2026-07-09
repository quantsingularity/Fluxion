import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiDownload,
  FiExternalLink,
  FiRepeat,
  FiSearch,
} from "react-icons/fi";

const allTransactions = [
  {
    id: "0x8f2a…c41d",
    type: "Swap",
    detail: "USDC → sTSLA",
    amount: "-$1,200.00",
    status: "Completed",
    time: "2 min ago",
    chain: "Ethereum",
  },
  {
    id: "0x2b9e…7a03",
    type: "Add Liquidity",
    detail: "ETH-USDC Pool",
    amount: "-$4,000.00",
    status: "Completed",
    time: "1 hr ago",
    chain: "Arbitrum",
  },
  {
    id: "0x5c17…9f88",
    type: "Mint",
    detail: "sGOLD",
    amount: "-$1,740.00",
    status: "Completed",
    time: "5 hrs ago",
    chain: "Optimism",
  },
  {
    id: "0xa4d0…21bc",
    type: "Claim Rewards",
    detail: "WBTC-ETH Pool",
    amount: "+$86.40",
    status: "Completed",
    time: "1 day ago",
    chain: "Ethereum",
  },
  {
    id: "0x7e63…4d2f",
    type: "Remove Liquidity",
    detail: "LINK-ETH Pool",
    amount: "+$2,310.00",
    status: "Pending",
    time: "1 day ago",
    chain: "Polygon",
  },
  {
    id: "0x1f88…b0a9",
    type: "Swap",
    detail: "sTSLA → USDC",
    amount: "+$980.00",
    status: "Failed",
    time: "3 days ago",
    chain: "Ethereum",
  },
  {
    id: "0x9c22…e7f1",
    type: "Bridge",
    detail: "USDC to Base",
    amount: "-$500.00",
    status: "Completed",
    time: "4 days ago",
    chain: "Base",
  },
];

const typeIcon = {
  Swap: FiRepeat,
  "Add Liquidity": FiArrowUpRight,
  "Remove Liquidity": FiArrowDownLeft,
  Mint: FiArrowUpRight,
  "Claim Rewards": FiArrowDownLeft,
  Bridge: FiRepeat,
};

const statusColor = {
  Completed: "green",
  Pending: "yellow",
  Failed: "red",
};

const Transactions = () => {
  const cardBg = useColorModeValue("gray.800", "gray.700");
  const borderColor = useColorModeValue("gray.700", "gray.600");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchesSearch =
        !search ||
        tx.detail.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <Box>
      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={8}
      >
        <Box>
          <Heading size="lg">Transactions</Heading>
          <Text color="gray.400" mt={1}>
            A complete history of your on-chain activity.
          </Text>
        </Box>
        <Button
          leftIcon={<FiDownload />}
          variant="outline"
          borderColor="gray.700"
          _hover={{ borderColor: "brand.500", color: "brand.300" }}
        >
          Export CSV
        </Button>
      </Flex>

      <Flex
        gap={3}
        mb={5}
        direction={{ base: "column", md: "row" }}
        align={{ md: "center" }}
      >
        <InputGroup maxW={{ md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search by asset or hash"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={cardBg}
            borderColor="gray.700"
          />
        </InputGroup>
        <Select
          maxW={{ md: "180px" }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          bg={cardBg}
          borderColor="gray.700"
        >
          <option value="all">All types</option>
          <option value="Swap">Swap</option>
          <option value="Add Liquidity">Add Liquidity</option>
          <option value="Remove Liquidity">Remove Liquidity</option>
          <option value="Mint">Mint</option>
          <option value="Claim Rewards">Claim Rewards</option>
          <option value="Bridge">Bridge</option>
        </Select>
        <Select
          maxW={{ md: "160px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          bg={cardBg}
          borderColor="gray.700"
        >
          <option value="all">All statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </Select>
      </Flex>

      <Box
        bg={cardBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="gray.500" borderColor="gray.700">
                  Type
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Detail
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Chain
                </Th>
                <Th color="gray.500" borderColor="gray.700" isNumeric>
                  Amount
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Status
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Time
                </Th>
                <Th color="gray.500" borderColor="gray.700" />
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((tx) => (
                <Tr key={tx.id} _hover={{ bg: "whiteAlpha.50" }}>
                  <Td borderColor="gray.700">
                    <HStack>
                      <Flex
                        w="30px"
                        h="30px"
                        borderRadius="md"
                        bg="whiteAlpha.100"
                        align="center"
                        justify="center"
                      >
                        <Icon
                          as={typeIcon[tx.type] || FiRepeat}
                          color="brand.300"
                          boxSize={4}
                        />
                      </Flex>
                      <Text fontWeight="medium">{tx.type}</Text>
                    </HStack>
                  </Td>
                  <Td borderColor="gray.700" color="gray.300">
                    {tx.detail}
                  </Td>
                  <Td borderColor="gray.700">
                    <Badge variant="subtle" colorScheme="gray">
                      {tx.chain}
                    </Badge>
                  </Td>
                  <Td
                    borderColor="gray.700"
                    isNumeric
                    fontWeight="semibold"
                    color={tx.amount.startsWith("+") ? "green.400" : "gray.200"}
                  >
                    {tx.amount}
                  </Td>
                  <Td borderColor="gray.700">
                    <Badge colorScheme={statusColor[tx.status]}>
                      {tx.status}
                    </Badge>
                  </Td>
                  <Td borderColor="gray.700" color="gray.500" fontSize="xs">
                    {tx.time}
                  </Td>
                  <Td borderColor="gray.700">
                    <Icon
                      as={FiExternalLink}
                      color="gray.500"
                      cursor="pointer"
                      _hover={{ color: "brand.300" }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        {filtered.length === 0 && (
          <Flex py={12} justify="center" align="center" direction="column">
            <Text color="gray.500">No transactions match your filters.</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default Transactions;
