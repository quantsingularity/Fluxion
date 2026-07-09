import { act, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock the API client so we can simulate the backend being unreachable and
// confirm the context falls back to a local demo session.
jest.mock("../api/client", () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => Promise.reject({ message: "network" })),
  getStoredUser: jest.fn(() => Promise.resolve(null)),
  isAuthenticated: jest.fn(() => Promise.resolve(false)),
  loginUser: jest.fn(() => Promise.reject({ message: "Network Error" })),
  logoutUser: jest.fn(() => Promise.resolve()),
  registerUser: jest.fn(() => Promise.resolve({})),
  requestPasswordReset: jest.fn(() => Promise.resolve()),
  setAuthTokens: jest.fn(() => Promise.resolve()),
  setStoredUser: jest.fn(() => Promise.resolve()),
}));

let auth;
const Probe = () => {
  auth = useAuth();
  return <Text>{auth.isAuthenticated ? "in" : "out"}</Text>;
};

describe("AuthContext", () => {
  it("starts unauthenticated after initialization", async () => {
    const { findByText } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await findByText("out")).toBeTruthy();
  });

  it("falls back to a demo session when the backend is unreachable", async () => {
    const { findByText } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await findByText("out");

    let result;
    await act(async () => {
      result = await auth.signIn({
        email: "demo@fluxion.finance",
        password: "whatever",
      });
    });

    expect(result.ok).toBe(true);
    expect(result.demo).toBe(true);
    await waitFor(() => expect(auth.user?.email).toBe("demo@fluxion.finance"));
  });
});
