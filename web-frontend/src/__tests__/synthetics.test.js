import {
  burnSynthetic,
  decodeAssetIdLabel,
  getSyntheticPosition,
  liquidatePosition,
  listSyntheticAssets,
  mintSynthetic,
} from "../pages/synthetics.js";

const mockMintSynthetic = jest.fn();
const mockBurnSynthetic = jest.fn();
const mockLiquidate = jest.fn();
const mockGetPosition = jest.fn();
const mockGetAssetCount = jest.fn();
const mockAssetIds = jest.fn();
const mockSyntheticAssets = jest.fn();

const mockAddress = "0x000000000000000000000000000000000000AA";
const mockSigner = { getAddress: async () => mockAddress };

jest.mock("../lib/env", () => ({
  env: { FACTORY_ADDRESS: () => "0x00000000000000000000000000000000000FAC" },
  ZERO_ADDRESS: "0x0000000000000000000000000000000000dEaD",
}));

jest.mock("ethers", () => {
  const actual = jest.requireActual("ethers");
  const MockContract = jest.fn().mockImplementation(() => ({
    mintSynthetic: mockMintSynthetic,
    burnSynthetic: mockBurnSynthetic,
    liquidate: mockLiquidate,
    getPosition: mockGetPosition,
    getAssetCount: mockGetAssetCount,
    assetIds: mockAssetIds,
    syntheticAssets: mockSyntheticAssets,
  }));
  return {
    ...actual,
    Contract: MockContract,
    ethers: { ...actual.ethers, Contract: MockContract },
  };
});

const fakeProvider = { getSigner: async () => mockSigner };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("synthetics.js", () => {
  describe("decodeAssetIdLabel", () => {
    it("decodes a bytes32 string-encoded asset id back to its label", () => {
      const { ethers } = jest.requireActual("ethers");
      const encoded = ethers.encodeBytes32String("sETH");
      expect(decodeAssetIdLabel(encoded)).toBe("sETH");
    });

    it("falls back to the raw hex for a non-string bytes32 (e.g. a hash)", () => {
      const hash =
        "0x1111111111111111111111111111111111111111111111111111111111111a".slice(
          0,
          66,
        );
      expect(decodeAssetIdLabel(hash)).toBe(hash);
    });
  });

  describe("mintSynthetic", () => {
    it("calls the real contract's mintSynthetic with assetId, collateral, synthetic amounts in order", async () => {
      mockMintSynthetic.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({}),
      });

      await mintSynthetic(fakeProvider, "0xassetId", 300n, 100n);

      expect(mockMintSynthetic).toHaveBeenCalledWith("0xassetId", 300n, 100n);
    });
  });

  describe("burnSynthetic", () => {
    it("calls the real contract's burnSynthetic with assetId and amount", async () => {
      mockBurnSynthetic.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({}),
      });

      await burnSynthetic(fakeProvider, "0xassetId", 100n);

      expect(mockBurnSynthetic).toHaveBeenCalledWith("0xassetId", 100n);
    });
  });

  describe("liquidatePosition", () => {
    it("calls the real contract's liquidate with assetId, user, and repaid amount", async () => {
      mockLiquidate.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({}),
      });

      await liquidatePosition(fakeProvider, "0xassetId", "0xUser", 50n);

      expect(mockLiquidate).toHaveBeenCalledWith("0xassetId", "0xUser", 50n);
    });
  });

  describe("getSyntheticPosition", () => {
    it("returns the position as a named object matching getPosition's tuple", async () => {
      mockGetPosition.mockResolvedValue([300n, 100n, 30000n, false]);

      const pos = await getSyntheticPosition(
        fakeProvider,
        "0xassetId",
        "0xUser",
      );

      expect(pos).toEqual({
        collateral: 300n,
        debt: 100n,
        ratioBPS: 30000n,
        isLiquidatable: false,
      });
    });
  });

  describe("listSyntheticAssets", () => {
    it("enumerates every registered asset via getAssetCount/assetIds/syntheticAssets", async () => {
      const { ethers } = jest.requireActual("ethers");
      const ethAssetId = ethers.encodeBytes32String("sETH");
      const btcAssetId = ethers.encodeBytes32String("sBTC");

      mockGetAssetCount.mockResolvedValue(2n);
      mockAssetIds.mockImplementation((i) =>
        Promise.resolve(i === 0 ? ethAssetId : btcAssetId),
      );
      mockSyntheticAssets.mockImplementation((assetId) => {
        const isEth = assetId === ethAssetId;
        return Promise.resolve([
          isEth ? "0xSynthETH" : "0xSynthBTC", // syntheticToken
          isEth ? "0xCollateralA" : "0xCollateralB", // collateralToken
          "0xPriceOracle", // priceOracle
          "0xClOracle", // clOracle
          ethers.encodeBytes32String("job"), // clJobId
          0n, // clFee
          isEth ? 1700_000000000000000000n : 42000_000000000000000000n, // price
          1710000000n, // priceTimestamp
          true, // active
        ]);
      });

      const assets = await listSyntheticAssets(fakeProvider);

      expect(assets).toHaveLength(2);
      expect(assets[0]).toEqual({
        assetId: ethAssetId,
        label: "sETH",
        syntheticToken: "0xSynthETH",
        collateralToken: "0xCollateralA",
        price18: 1700_000000000000000000n,
        priceTimestamp: 1710000000n,
        active: true,
      });
      expect(assets[1].label).toBe("sBTC");
    });

    it("returns an empty list when no assets are registered", async () => {
      mockGetAssetCount.mockResolvedValue(0n);
      const assets = await listSyntheticAssets(fakeProvider);
      expect(assets).toEqual([]);
      expect(mockAssetIds).not.toHaveBeenCalled();
    });
  });
});
