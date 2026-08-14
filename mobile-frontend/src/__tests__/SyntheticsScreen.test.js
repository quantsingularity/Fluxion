import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import { fetchAssets } from "../api/client";
import SyntheticsScreen from "../screens/SyntheticsScreen";

jest.mock("../api/client", () => ({
  fetchAssets: jest.fn(),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

const REAL_ASSET = {
  id: "syn-eth",
  name: "Synthetic Ethereum",
  symbol: "synETH",
  underlying_asset: "ETH",
  price: 3450.25,
  price_change_24h: 2.4,
  collateral_ratio: 1.5,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyntheticsScreen", () => {
  it("renders demo data and a demo notice when the API call fails", async () => {
    fetchAssets.mockRejectedValue(new Error("network error"));

    render(<SyntheticsScreen />);

    await waitFor(() => expect(fetchAssets).toHaveBeenCalled());
    expect(await screen.findByText(/Showing demo data/i)).toBeTruthy();
    // mockData's first synthetic asset
    expect(await screen.findByText("sTSLA")).toBeTruthy();
  });

  it("renders real backend data and hides the demo notice when the API succeeds", async () => {
    fetchAssets.mockResolvedValue([REAL_ASSET]);

    render(<SyntheticsScreen />);

    expect(await screen.findByText("synETH")).toBeTruthy();
    expect(screen.queryByText(/Showing demo data/i)).toBeNull();
  });

  it("normalizes numeric backend fields into the display strings the card expects", async () => {
    fetchAssets.mockResolvedValue([REAL_ASSET]);

    render(<SyntheticsScreen />);

    expect(await screen.findByText("$3,450.25")).toBeTruthy();
    expect(await screen.findByText("+2.4%")).toBeTruthy();
    expect(await screen.findByText("150% collateral")).toBeTruthy();
  });

  it("shows an honest message instead of silently doing nothing on Trade", async () => {
    fetchAssets.mockResolvedValue([REAL_ASSET]);

    render(<SyntheticsScreen />);
    const tradeButton = await screen.findByText("Trade");
    fireEvent.press(tradeButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Trading not yet available",
      expect.stringContaining("synETH"),
    );
  });
});
