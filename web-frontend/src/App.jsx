import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Analytics from "./pages/analytics/Analytics";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import NotFound from "./pages/NotFound";
import CreatePool from "./pages/pools/CreatePool";
import Pools from "./pages/pools/Pools";
import Portfolio from "./pages/portfolio/Portfolio";
import Settings from "./pages/settings/Settings";
import Synthetics from "./pages/synthetics/Synthetics";
import Transactions from "./pages/transactions/Transactions";

// Convenience wrapper so protected pages read clearly in the route table.
const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <Routes>
      {/* Standalone auth screens (no app chrome) */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public pages without the app sidebar */}
      <Route element={<PublicLayout />}>
        {/* Homepage is the public entry point */}
        <Route path="/" element={<Home />} />
      </Route>

      {/* Authenticated application area (with sidebar) */}
      <Route element={<AppShell />}>
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/pools"
          element={
            <Protected>
              <Pools />
            </Protected>
          }
        />
        <Route
          path="/pools/create"
          element={
            <Protected>
              <CreatePool />
            </Protected>
          }
        />
        <Route
          path="/synthetics"
          element={
            <Protected>
              <Synthetics />
            </Protected>
          }
        />
        <Route
          path="/analytics"
          element={
            <Protected>
              <Analytics />
            </Protected>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Protected>
              <Portfolio />
            </Protected>
          }
        />
        <Route
          path="/transactions"
          element={
            <Protected>
              <Transactions />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <Settings />
            </Protected>
          }
        />
      </Route>

      {/* 404 (public, no sidebar) */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
