import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiDollarSign,
  FiDroplet,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../lib/auth-context.jsx";

const performanceData = [
  { name: "Week 1", value: 12400 },
  { name: "Week 2", value: 12980 },
  { name: "Week 3", value: 12610 },
  { name: "Week 4", value: 13720 },
  { name: "Week 5", value: 14180 },
  { name: "Week 6", value: 14960 },
  { name: "Week 7", value: 15840 },
];

const allocation = [
  { name: "ETH-USDC LP", value: 6200, color: "#0080ff" },
  { name: "WBTC-ETH LP", value: 4100, color: "#ff7000" },
  { name: "sTSLA", value: 2600, color: "#22c55e" },
  { name: "sGOLD", value: 1740, color: "#a855f7" },
  { name: "Idle USDC", value: 1200, color: "#eab308" },
];

const holdings = [
  {
    asset: "ETH-USDC LP",
    type: "Liquidity",
    amount: "3.42 LP",
    value: "$6,200",
    apy: "8.4%",
    pnl: "+12.6%",
    up: true,
  },
  {
    asset: "WBTC-ETH LP",
    type: "Liquidity",
    amount: "0.18 LP",
    value: "$4,100",
    apy: "7.2%",
    pnl: "+9.1%",
    up: true,
  },
  {
    asset: "sTSLA",
    type: "Synthetic",
    amount: "9.8 sTSLA",
    value: "$2,600",
    apy: "-",
    pnl: "-2.4%",
    up: false,
  },
  {
    asset: "sGOLD",
    type: "Synthetic",
    amount: "0.74 sGOLD",
    value: "$1,740",
    apy: "-",
    pnl: "+4.8%",
    up: true,
  },
  {
    asset: "USDC",
    type: "Wallet",
    amount: "1,200 USDC",
    value: "$1,200",
    apy: "-",
    pnl: "0.0%",
    up: true,
  },
];

const Portfolio = () => {
  const { user } = useAuth();
  const cardBg = useColorModeValue("gray.800", "gray.700");
  const borderColor = useColorModeValue("gray.700", "gray.600");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // The portfolio endpoint would populate real holdings here; until the
    // backend is reachable we render representative data.
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const total = allocation.reduce((sum, a) => sum + a.value, 0);

  const stats = [
    {
      label: "Portfolio Value",
      value: "$15,840",
      change: "+27.7%",
      up: true,
      icon: FiDollarSign,
    },
    {
      label: "Total P&L",
      value: "+$3,440",
      change: "+8.2% (24h)",
      up: true,
      icon: FiTrendingUp,
    },
    {
      label: "Liquidity Positions",
      value: "2",
      change: "$10,300 supplied",
      up: true,
      icon: FiDroplet,
    },
    {
      label: "Est. Yearly Yield",
      value: "$1,264",
      change: "7.98% APY",
      up: true,
      icon: FiPieChart,
    },
  ];

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
          <Heading size="lg">Portfolio</Heading>
          <Text color="gray.400" mt={1}>
            {user?.first_name
              ? `${user.first_name}'s positions`
              : "Your positions"}{" "}
            across pools and synthetic assets.
          </Text>
        </Box>
        <HStack>
          <Button
            as={RouterLink}
            to="/pools"
            variant="outline"
            borderColor="gray.700"
          >
            Add Liquidity
          </Button>
          <Button
            as={RouterLink}
            to="/synthetics"
            colorScheme="brand"
            bgGradient="linear(to-r, brand.500, accent.500)"
            _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
          >
            Trade
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={5} mb={8}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            bg={cardBg}
            p={5}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <Stat>
              <HStack mb={1}>
                <Icon as={stat.icon} color="brand.400" boxSize={4} />
                <StatLabel fontSize="xs" color="gray.400">
                  {stat.label}
                </StatLabel>
              </HStack>
              <StatNumber fontSize="xl">{loaded ? stat.value : "-"}</StatNumber>
              <StatHelpText mb={0}>
                <StatArrow type={stat.up ? "increase" : "decrease"} />
                {stat.change}
              </StatHelpText>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} mb={8}>
        <Box
          gridColumn={{ lg: "span 2" }}
          bg={cardBg}
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Performance
          </Heading>
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="pfArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0080ff" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0080ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,20,30,0.95)",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  formatter={(v) => [`$${v.toLocaleString()}`, "Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0080ff"
                  strokeWidth={2}
                  fill="url(#pfArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box
          bg={cardBg}
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Allocation
          </Heading>
          <Box h="180px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {allocation.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,20,30,0.95)",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  formatter={(v) => `$${v.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <VStack align="stretch" spacing={2} mt={3}>
            {allocation.map((item) => (
              <Flex key={item.name} justify="space-between" align="center">
                <HStack>
                  <Box w="10px" h="10px" borderRadius="full" bg={item.color} />
                  <Text fontSize="sm" color="gray.300">
                    {item.name}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.400">
                  {((item.value / total) * 100).toFixed(0)}%
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>

      <Box
        bg={cardBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Flex justify="space-between" align="center" p={6} pb={2}>
          <Heading size="md">Holdings</Heading>
          <Button
            as={RouterLink}
            to="/transactions"
            size="sm"
            variant="ghost"
            color="brand.400"
            rightIcon={<FiArrowUpRight />}
          >
            View transactions
          </Button>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="gray.500" borderColor="gray.700">
                  Asset
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Type
                </Th>
                <Th color="gray.500" borderColor="gray.700">
                  Amount
                </Th>
                <Th color="gray.500" borderColor="gray.700" isNumeric>
                  Value
                </Th>
                <Th color="gray.500" borderColor="gray.700" isNumeric>
                  APY
                </Th>
                <Th color="gray.500" borderColor="gray.700" isNumeric>
                  P&L
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {holdings.map((h) => (
                <Tr key={h.asset} _hover={{ bg: "whiteAlpha.50" }}>
                  <Td borderColor="gray.700" fontWeight="semibold">
                    {h.asset}
                  </Td>
                  <Td borderColor="gray.700">
                    <Badge
                      colorScheme={
                        h.type === "Liquidity"
                          ? "blue"
                          : h.type === "Synthetic"
                            ? "purple"
                            : "gray"
                      }
                    >
                      {h.type}
                    </Badge>
                  </Td>
                  <Td borderColor="gray.700" color="gray.300">
                    {h.amount}
                  </Td>
                  <Td borderColor="gray.700" isNumeric fontWeight="semibold">
                    {h.value}
                  </Td>
                  <Td borderColor="gray.700" isNumeric color="gray.300">
                    {h.apy}
                  </Td>
                  <Td
                    borderColor="gray.700"
                    isNumeric
                    color={h.up ? "green.400" : "red.400"}
                    fontWeight="semibold"
                  >
                    {h.pnl}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Portfolio;
