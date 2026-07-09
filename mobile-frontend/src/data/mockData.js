import { colors } from "../theme/theme";

// Representative demo data used as a graceful fallback whenever the backend is
// unreachable, so every screen renders a complete, realistic experience.

export const marketStats = {
  tvl: "$142.5M",
  volume24h: "$28.4M",
  activePools: 247,
  avgApy: "8.74%",
};

export const tvlHistory = [
  { name: "Jan", value: 45 },
  { name: "Feb", value: 62 },
  { name: "Mar", value: 78 },
  { name: "Apr", value: 95 },
  { name: "May", value: 115 },
  { name: "Jun", value: 132 },
  { name: "Jul", value: 142 },
];

export const volumeHistory = [
  { name: "Mon", value: 24 },
  { name: "Tue", value: 14 },
  { name: "Wed", value: 38 },
  { name: "Thu", value: 30 },
  { name: "Fri", value: 41 },
  { name: "Sat", value: 22 },
  { name: "Sun", value: 28 },
];

export const featuredPools = [
  {
    id: "eth-usdc",
    name: "ETH-USDC",
    assets: ["ETH", "USDC"],
    weights: [50, 50],
    apy: "8.4%",
    tvl: "$4.2M",
    volume24h: "$1.2M",
    fee: "0.30%",
    type: "Weighted",
    utilization: 78,
    risk: "Low",
  },
  {
    id: "wbtc-eth",
    name: "WBTC-ETH",
    assets: ["WBTC", "ETH"],
    weights: [60, 40],
    apy: "7.2%",
    tvl: "$8.7M",
    volume24h: "$3.5M",
    fee: "0.30%",
    type: "Weighted",
    utilization: 65,
    risk: "Medium",
  },
  {
    id: "usdc-dai",
    name: "USDC-DAI",
    assets: ["USDC", "DAI"],
    weights: [50, 50],
    apy: "4.5%",
    tvl: "$2.5M",
    volume24h: "$640K",
    fee: "0.05%",
    type: "Stable",
    utilization: 82,
    risk: "Low",
  },
  {
    id: "link-eth",
    name: "LINK-ETH",
    assets: ["LINK", "ETH"],
    weights: [30, 70],
    apy: "9.3%",
    tvl: "$950K",
    volume24h: "$220K",
    fee: "0.30%",
    type: "Weighted",
    utilization: 71,
    risk: "Medium",
  },
];

export const syntheticAssets = [
  {
    id: "stsla",
    symbol: "sTSLA",
    name: "Tesla Inc.",
    category: "Stocks",
    price: "$264.30",
    change: "+2.4%",
    up: true,
    collateral: "165%",
    history: [240, 248, 255, 250, 258, 262, 264],
  },
  {
    id: "sgold",
    symbol: "sGOLD",
    name: "Gold (oz)",
    category: "Commodities",
    price: "$2,341.10",
    change: "+0.8%",
    up: true,
    collateral: "150%",
    history: [2300, 2310, 2325, 2318, 2330, 2338, 2341],
  },
  {
    id: "saapl",
    symbol: "sAAPL",
    name: "Apple Inc.",
    category: "Stocks",
    price: "$226.80",
    change: "-1.2%",
    up: false,
    collateral: "160%",
    history: [232, 230, 228, 231, 229, 227, 226],
  },
  {
    id: "seur",
    symbol: "sEUR",
    name: "Euro",
    category: "Forex",
    price: "$1.09",
    change: "+0.1%",
    up: true,
    collateral: "120%",
    history: [1.08, 1.085, 1.088, 1.086, 1.089, 1.09, 1.09],
  },
  {
    id: "soil",
    symbol: "sOIL",
    name: "Crude Oil",
    category: "Commodities",
    price: "$78.40",
    change: "-0.6%",
    up: false,
    collateral: "170%",
    history: [80, 79.5, 79, 78.8, 78.6, 78.5, 78.4],
  },
];

export const portfolioSummary = {
  value: "$15,840",
  pnl: "+$3,440",
  pnlPct: "+27.7%",
  positions: 5,
  yearlyYield: "$1,264",
};

export const portfolioPerformance = [
  { name: "W1", value: 12400 },
  { name: "W2", value: 12980 },
  { name: "W3", value: 12610 },
  { name: "W4", value: 13720 },
  { name: "W5", value: 14180 },
  { name: "W6", value: 14960 },
  { name: "W7", value: 15840 },
];

export const allocation = [
  { name: "ETH-USDC LP", value: 6200, color: colors.brand[500] },
  { name: "WBTC-ETH LP", value: 4100, color: colors.accent[500] },
  { name: "sTSLA", value: 2600, color: colors.success },
  { name: "sGOLD", value: 1740, color: colors.purple },
  { name: "Idle USDC", value: 1200, color: colors.warning },
];

export const holdings = [
  {
    asset: "ETH-USDC LP",
    type: "Liquidity",
    amount: "3.42 LP",
    value: "$6,200",
    pnl: "+12.6%",
    up: true,
  },
  {
    asset: "WBTC-ETH LP",
    type: "Liquidity",
    amount: "0.18 LP",
    value: "$4,100",
    pnl: "+9.1%",
    up: true,
  },
  {
    asset: "sTSLA",
    type: "Synthetic",
    amount: "9.8 sTSLA",
    value: "$2,600",
    pnl: "-2.4%",
    up: false,
  },
  {
    asset: "sGOLD",
    type: "Synthetic",
    amount: "0.74 sGOLD",
    value: "$1,740",
    pnl: "+4.8%",
    up: true,
  },
  {
    asset: "USDC",
    type: "Wallet",
    amount: "1,200 USDC",
    value: "$1,200",
    pnl: "0.0%",
    up: true,
  },
];

export const transactions = [
  {
    id: "0x8f2ac41d",
    type: "Swap",
    detail: "USDC → sTSLA",
    amount: "-$1,200.00",
    status: "Completed",
    time: "2 min ago",
    chain: "Ethereum",
  },
  {
    id: "0x2b9e7a03",
    type: "Add Liquidity",
    detail: "ETH-USDC Pool",
    amount: "-$4,000.00",
    status: "Completed",
    time: "1 hr ago",
    chain: "Arbitrum",
  },
  {
    id: "0x5c179f88",
    type: "Mint",
    detail: "sGOLD",
    amount: "-$1,740.00",
    status: "Completed",
    time: "5 hrs ago",
    chain: "Optimism",
  },
  {
    id: "0xa4d021bc",
    type: "Claim Rewards",
    detail: "WBTC-ETH Pool",
    amount: "+$86.40",
    status: "Completed",
    time: "1 day ago",
    chain: "Ethereum",
  },
  {
    id: "0x7e634d2f",
    type: "Remove Liquidity",
    detail: "LINK-ETH Pool",
    amount: "+$2,310.00",
    status: "Pending",
    time: "1 day ago",
    chain: "Polygon",
  },
  {
    id: "0x1f88b0a9",
    type: "Swap",
    detail: "sTSLA → USDC",
    amount: "+$980.00",
    status: "Failed",
    time: "3 days ago",
    chain: "Ethereum",
  },
];

export const poolDistribution = [
  { name: "ETH-USDC", value: 2400, color: colors.brand[500] },
  { name: "WBTC-ETH", value: 1800, color: colors.accent[500] },
  { name: "LINK-ETH", value: 950, color: colors.success },
  { name: "UNI-USDT", value: 750, color: colors.purple },
  { name: "Others", value: 1200, color: colors.warning },
];

export const riskMetrics = [
  { label: "Value at Risk (95%)", value: "$4.2M", tone: "warning" },
  { label: "Sharpe Ratio", value: "1.84", tone: "success" },
  { label: "Max Drawdown", value: "-12.4%", tone: "danger" },
  { label: "Volatility (30d)", value: "18.6%", tone: "neutral" },
];
