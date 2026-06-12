import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Pools from "../pages/pools/Pools";

// Mock the web3 hook
jest.mock("../lib/web3-config.jsx", () => ({
  useWeb3: () => ({
    isConnected: true,
    pools: [],
  }),
}));

// Mock the recharts components
jest.mock("recharts", () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
}));

const renderPools = () => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <Pools />
      </ChakraProvider>
    </BrowserRouter>,
  );
};

describe("Pools Component", () => {
  it("renders the page heading", () => {
    renderPools();
    expect(screen.getByText("Liquidity Pools")).toBeInTheDocument();
  });

  it("renders the available pools section", () => {
    renderPools();
    expect(screen.getByText("Available Pools")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    renderPools();
    expect(screen.getByPlaceholderText("Search pools...")).toBeInTheDocument();
  });

  it("updates the search input value on change", () => {
    renderPools();
    const input = screen.getByPlaceholderText("Search pools...");
    fireEvent.change(input, { target: { value: "ETH" } });
    expect(input.value).toBe("ETH");
  });

  it("renders the filter control", () => {
    renderPools();
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });

  it("renders the my-liquidity section", () => {
    renderPools();
    expect(screen.getAllByText("My Liquidity").length).toBeGreaterThan(0);
  });
});
