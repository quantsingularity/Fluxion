import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";

// Mock the web3 hook
jest.mock("../lib/web3-config.jsx", () => ({
  useWeb3: () => ({
    isConnected: true,
    pools: [],
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

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <Dashboard />
      </ChakraProvider>
    </BrowserRouter>,
  );
};

describe("Dashboard Component", () => {
  it("renders the welcome heading", () => {
    renderDashboard();
    expect(screen.getByText("Welcome to Fluxion")).toBeInTheDocument();
  });

  it("renders the action buttons", () => {
    renderDashboard();
    expect(screen.getByText("Explore Pools")).toBeInTheDocument();
    expect(screen.getByText("Create Pool")).toBeInTheDocument();
  });

  it("renders the stats overview labels", () => {
    renderDashboard();
    // "Total Value Locked" appears as both a stat label and a chart heading.
    expect(screen.getAllByText("Total Value Locked").length).toBeGreaterThan(0);
    expect(screen.getByText("24h Volume")).toBeInTheDocument();
    expect(screen.getByText("Active Pools")).toBeInTheDocument();
    expect(screen.getByText("Average APY")).toBeInTheDocument();
  });

  it("renders the stat values", () => {
    renderDashboard();
    expect(screen.getByText("$142.5M")).toBeInTheDocument();
    expect(screen.getByText("$28.4M")).toBeInTheDocument();
  });

  it("renders the charts", () => {
    renderDashboard();
    // Dashboard uses Area, Bar and Pie charts (rendered via mocked recharts).
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders the pool distribution section", () => {
    renderDashboard();
    expect(screen.getByText("Pool Distribution")).toBeInTheDocument();
  });

  it("renders tabbed positions and transactions", () => {
    renderDashboard();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(0);
    fireEvent.click(tabs[tabs.length - 1]);
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
  });
});
