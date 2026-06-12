import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Synthetics from "../pages/synthetics/Synthetics";

// Mock the web3 hook
jest.mock("../lib/web3-config.jsx", () => ({
  useWeb3: () => ({
    isConnected: true,
  }),
}));

// Mock the recharts components
jest.mock("recharts", () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

const renderSynthetics = () => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <Synthetics />
      </ChakraProvider>
    </BrowserRouter>,
  );
};

describe("Synthetics Component", () => {
  it("renders the page heading", () => {
    renderSynthetics();
    expect(screen.getByText("Synthetic Assets")).toBeInTheDocument();
  });

  it("renders the mint synthetic button", () => {
    renderSynthetics();
    expect(screen.getByText("Mint Synthetic")).toBeInTheDocument();
  });

  it("renders the total value locked stat", () => {
    renderSynthetics();
    expect(screen.getAllByText("Total Value Locked").length).toBeGreaterThan(0);
    expect(screen.getByText("$157.5M")).toBeInTheDocument();
  });

  it("renders the synthetic assets list", () => {
    renderSynthetics();
    expect(screen.getAllByText("sETH").length).toBeGreaterThan(0);
    expect(screen.getAllByText("sBTC").length).toBeGreaterThan(0);
  });

  it("renders the positions and history tabs", () => {
    renderSynthetics();
    expect(screen.getByText("My Positions")).toBeInTheDocument();
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
  });

  it("renders price and volume charts", () => {
    renderSynthetics();
    expect(
      screen.getAllByTestId("responsive-container").length,
    ).toBeGreaterThan(0);
  });
});
