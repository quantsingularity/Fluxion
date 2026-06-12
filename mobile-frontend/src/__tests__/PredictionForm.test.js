import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import PredictionForm from "../components/PredictionForm";

// Mock the date-fns format function
jest.mock("date-fns", () => ({
  format: (date) => date.toISOString(),
}));

describe("PredictionForm", () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders all form elements", () => {
    const { getByText, getByPlaceholderText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} />
      </PaperProvider>,
    );

    expect(getByText("Timestamps")).toBeTruthy();
    expect(getByText("Add Timestamp")).toBeTruthy();
    expect(getByPlaceholderText("meter1, meter2, meter3")).toBeTruthy();
    expect(
      getByPlaceholderText('{"temperature": 22.5, "humidity": 65}'),
    ).toBeTruthy();
    expect(getByText("Get Prediction")).toBeTruthy();
  });

  it("shows validation errors for empty fields", () => {
    const { getByText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} />
      </PaperProvider>,
    );

    fireEvent.press(getByText("Get Prediction"));

    expect(getByText("At least one timestamp is required.")).toBeTruthy();
    expect(getByText("Meter IDs are required.")).toBeTruthy();
    expect(getByText("Context Features are required.")).toBeTruthy();
  });

  it("validates JSON format for context features", () => {
    const { getByText, getByPlaceholderText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} />
      </PaperProvider>,
    );

    const contextInput = getByPlaceholderText(
      '{"temperature": 22.5, "humidity": 65}',
    );
    fireEvent.changeText(contextInput, "invalid json");
    fireEvent.press(getByText("Get Prediction"));

    expect(getByText("Context Features must be valid JSON.")).toBeTruthy();
  });

  it("submits form with valid data", async () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} />
      </PaperProvider>,
    );

    // Open the date picker and confirm a date through the mocked modal.
    fireEvent.press(getByText("Add Timestamp"));
    fireEvent.press(getByTestId("datetime-confirm"));

    const mockDate = new Date("2024-01-01T12:00:00");

    // Fill in meter IDs
    const meterInput = getByPlaceholderText("meter1, meter2, meter3");
    fireEvent.changeText(meterInput, "meter1, meter2");

    // Fill in context features
    const contextInput = getByPlaceholderText(
      '{"temperature": 22.5, "humidity": 65}',
    );
    fireEvent.changeText(contextInput, '{"temperature": 25, "humidity": 60}');

    // Submit the form
    fireEvent.press(getByText("Get Prediction"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        [mockDate.toISOString()],
        ["meter1", "meter2"],
        { temperature: 25, humidity: 60 },
      );
    });
  });

  it("disables submit button when loading", () => {
    const { getByText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} isLoading={true} />
      </PaperProvider>,
    );

    // The label has no `disabled` prop; the disabled state lives on the
    // touchable ancestor that carries accessibilityRole="button".
    let node = getByText("Getting Prediction...");
    while (node && node.props?.accessibilityRole !== "button") {
      node = node.parent;
    }
    expect(node).toBeTruthy();
    expect(node.props.accessibilityState?.disabled).toBe(true);
  });

  it("removes timestamp when clicking close on chip", () => {
    const { getByText, getByTestId, getByLabelText, queryByText } = render(
      <PaperProvider>
        <PredictionForm {...defaultProps} />
      </PaperProvider>,
    );

    // Open the date picker and confirm a date through the mocked modal.
    fireEvent.press(getByText("Add Timestamp"));
    fireEvent.press(getByTestId("datetime-confirm"));

    const mockDate = new Date("2024-01-01T12:00:00");

    // The chip is rendered with the (mocked) ISO-formatted date.
    expect(getByText(mockDate.toISOString())).toBeTruthy();

    // Press the chip's close affordance (Paper labels it "Close" by default).
    fireEvent.press(getByLabelText("Close"));

    // Verify the timestamp was removed.
    expect(queryByText(mockDate.toISOString())).toBeNull();
  });
});
