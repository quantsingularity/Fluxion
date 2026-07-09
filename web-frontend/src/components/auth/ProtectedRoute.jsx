import { Center, Spinner } from "@chakra-ui/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth-context.jsx";

// Guards routes that require an authenticated session. While the initial
// session restore is in flight we render a spinner so we do not briefly flash
// the sign in screen for users who already have a valid token.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Center h="60vh">
        <Spinner size="xl" thickness="3px" color="brand.400" speed="0.7s" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }

  return children;
};

export default ProtectedRoute;
