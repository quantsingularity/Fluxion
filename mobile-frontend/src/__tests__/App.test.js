import { render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import App from "../../App";

// Mock the screens so the test focuses on App's navigation shell, not screen
// internals (which make API calls and have their own tests).
jest.mock("../../src/screens/InputScreen", () => {
  const { Text } = require("react-native");
  return function MockInputScreen() {
    return <Text>InputScreen</Text>;
  };
});
jest.mock("../../src/screens/ResultsScreen", () => {
  const { Text } = require("react-native");
  return function MockResultsScreen() {
    return <Text>ResultsScreen</Text>;
  };
});
jest.mock("../../src/screens/AssetsScreen", () => {
  const { Text } = require("react-native");
  return function MockAssetsScreen() {
    return <Text>AssetsScreen</Text>;
  };
});
jest.mock("../../src/screens/PoolsScreen", () => {
  const { Text } = require("react-native");
  return function MockPoolsScreen() {
    return <Text>PoolsScreen</Text>;
  };
});

const renderApp = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <App />
    </SafeAreaProvider>,
  );

describe("App Component", () => {
  it("renders the bottom tab labels", async () => {
    const { getAllByText } = renderApp();
    await waitFor(() => {
      // Tab labels are rendered by the real bottom-tab navigator.
      expect(getAllByText("Prediction").length).toBeGreaterThan(0);
      expect(getAllByText("Assets").length).toBeGreaterThan(0);
      expect(getAllByText("Pools").length).toBeGreaterThan(0);
    });
  });

  it("renders the initial Prediction screen", async () => {
    const { getByText } = renderApp();
    await waitFor(() => {
      expect(getByText("InputScreen")).toBeTruthy();
    });
  });
});
