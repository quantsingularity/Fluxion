// Mock dependencies before importing the module.
// axios is mocked with a factory so axios.create() returns an instance that
// exposes interceptors and the HTTP verb methods. The bare jest.mock("axios")
// auto-mock returned undefined from create(), so module import crashed at
// `apiClient.interceptors.request.use(...)` and the whole suite failed to run.
jest.mock("axios", () => {
  const mockInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
    create: jest.fn(() => mockInstance),
  };
});
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: null,
    manifest: null,
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAuthToken, getAuthToken, setAuthToken } from "../api/client";

describe("API Client - Token Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Token Management", () => {
    it("sets auth token correctly", async () => {
      const token = "test-token";
      const expiryMinutes = 30;

      await setAuthToken(token, expiryMinutes);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@fluxion_auth_token",
        token,
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@fluxion_token_expiry",
        expect.any(String),
      );
    });

    it("gets auth token correctly", async () => {
      const token = "test-token";
      const futureExpiry = (Date.now() + 10 * 60 * 1000).toString();

      AsyncStorage.getItem
        .mockResolvedValueOnce(token)
        .mockResolvedValueOnce(futureExpiry);

      const result = await getAuthToken();

      expect(result).toBe(token);
    });

    it("returns null for expired token", async () => {
      const token = "test-token";
      const pastExpiry = (Date.now() - 10 * 60 * 1000).toString();

      AsyncStorage.getItem
        .mockResolvedValueOnce(token)
        .mockResolvedValueOnce(pastExpiry);

      const result = await getAuthToken();

      expect(result).toBeNull();
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it("clears auth token correctly", async () => {
      await clearAuthToken();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "@fluxion_auth_token",
        "@fluxion_token_expiry",
      ]);
    });

    it("handles AsyncStorage errors gracefully", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw error
      await expect(setAuthToken("token", 30)).resolves.toBeUndefined();
    });

    it("returns null when token is missing", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getAuthToken();

      expect(result).toBeNull();
    });

    it("returns null when expiry is missing", async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce("token")
        .mockResolvedValueOnce(null);

      const result = await getAuthToken();

      expect(result).toBeNull();
    });
  });
});
