// Verifies the email/password auth client hits the right endpoints and
// persists the returned tokens. axios is mocked so no network is required.
// The mock instance is created INSIDE the factory because jest hoists
// jest.mock above the imports; referencing an outer const would hit the TDZ.
jest.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
    create: jest.fn(() => instance),
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
} from "../api/client";

// The client called axios.create() at import; the same instance is returned here.
const instance = axios.create();

describe("auth client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a user and stores the returned access token", async () => {
    instance.post.mockResolvedValueOnce({
      data: {
        data: { access_token: "abc", refresh_token: "ref", expires_in: 1800 },
      },
    });

    await registerUser({
      email: "a@b.com",
      password: "Str0ng!Pass",
      first_name: "Ada",
    });

    expect(instance.post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        email: "a@b.com",
        confirm_password: "Str0ng!Pass",
        terms_accepted: true,
      }),
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@fluxion_auth_token",
      "abc",
    );
  });

  it("logs in with email + password", async () => {
    instance.post.mockResolvedValueOnce({
      data: { access_token: "tok", refresh_token: "r" },
    });

    await loginUser("a@b.com", "secret");

    expect(instance.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "secret",
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@fluxion_auth_token",
      "tok",
    );
  });

  it("fetches the current user", async () => {
    instance.get.mockResolvedValueOnce({
      data: { data: { email: "a@b.com" } },
    });
    const user = await getCurrentUser();
    expect(instance.get).toHaveBeenCalledWith("/auth/me");
    expect(user).toEqual({ email: "a@b.com" });
  });

  it("requests a password reset", async () => {
    instance.post.mockResolvedValueOnce({ data: { ok: true } });
    await requestPasswordReset("a@b.com");
    expect(instance.post).toHaveBeenCalledWith("/auth/password-reset", {
      email: "a@b.com",
    });
  });
});
