import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

// Mock the web3 hook so any consumer rendered through routing does not need a
// real Web3Provider.
jest.mock("../lib/web3-config.jsx", () => ({
  useWeb3: () => ({ isConnected: false, pools: [], account: null }),
}));

// Mock the auth context so protected routes render as an authenticated user.
jest.mock("../lib/auth-context.jsx", () => ({
  useAuth: () => ({
    user: { email: "test@fluxion.finance", first_name: "Test" },
    isAuthenticated: true,
    isInitializing: false,
    isSubmitting: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock the components
jest.mock("../components/layout/Navbar", () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

jest.mock("../components/layout/Sidebar", () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock("../pages/home/Home", () => {
  return function MockHome() {
    return <div data-testid="home">Home</div>;
  };
});

jest.mock("../pages/dashboard/Dashboard", () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock("../pages/pools/Pools", () => {
  return function MockPools() {
    return <div data-testid="pools">Pools</div>;
  };
});

jest.mock("../pages/pools/CreatePool", () => {
  return function MockCreatePool() {
    return <div data-testid="create-pool">Create Pool</div>;
  };
});

jest.mock("../pages/analytics/Analytics", () => {
  return function MockAnalytics() {
    return <div data-testid="analytics">Analytics</div>;
  };
});

jest.mock("../pages/settings/Settings", () => {
  return function MockSettings() {
    return <div data-testid="settings">Settings</div>;
  };
});

jest.mock("../pages/synthetics/Synthetics", () => {
  return function MockSynthetics() {
    return <div data-testid="synthetics">Synthetics</div>;
  };
});

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <BrowserRouter>
      <ChakraProvider>{ui}</ChakraProvider>
    </BrowserRouter>,
  );
};

describe("App Component", () => {
  it("renders the navbar on the homepage but not the sidebar", () => {
    renderWithRouter(<App />, { route: "/" });
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    // The homepage is public and must not show the app sidebar.
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("renders the sidebar inside the authenticated app shell", () => {
    renderWithRouter(<App />, { route: "/dashboard" });
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders Home on root path", () => {
    renderWithRouter(<App />, { route: "/" });
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("renders Dashboard on /dashboard path", () => {
    renderWithRouter(<App />, { route: "/dashboard" });
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("renders Pools page on /pools path", () => {
    renderWithRouter(<App />, { route: "/pools" });
    expect(screen.getByTestId("pools")).toBeInTheDocument();
  });

  it("renders Create Pool page on /pools/create path", () => {
    renderWithRouter(<App />, { route: "/pools/create" });
    expect(screen.getByTestId("create-pool")).toBeInTheDocument();
  });

  it("renders Synthetics page on /synthetics path", () => {
    renderWithRouter(<App />, { route: "/synthetics" });
    expect(screen.getByTestId("synthetics")).toBeInTheDocument();
  });

  it("renders Analytics page on /analytics path", () => {
    renderWithRouter(<App />, { route: "/analytics" });
    expect(screen.getByTestId("analytics")).toBeInTheDocument();
  });

  it("renders Settings page on /settings path", () => {
    renderWithRouter(<App />, { route: "/settings" });
    expect(screen.getByTestId("settings")).toBeInTheDocument();
  });
});
