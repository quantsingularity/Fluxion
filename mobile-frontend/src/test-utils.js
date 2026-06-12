// Shared test utilities.
//
// react-native-paper's Snackbar (and other components) call
// useSafeAreaInsets(), which throws "No safe area value available" unless a
// SafeAreaProvider is mounted above them. Screen tests previously rendered
// bare components, so any test that reached a state rendering a Snackbar
// (success, error) crashed. This custom render wraps every component in the
// same providers the real app uses, with deterministic safe-area metrics.

import { render as rtlRender } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function AllProviders({ children }) {
  return (
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <PaperProvider>{children}</PaperProvider>
    </SafeAreaProvider>
  );
}

function render(ui, options = {}) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RNTL so tests can import from one place.
export * from "@testing-library/react-native";
export { render, AllProviders };
