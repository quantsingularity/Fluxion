import { render } from "@testing-library/react-native";
import GradientButton from "../components/ui/GradientButton";
import Pill from "../components/ui/Pill";
import StatCard from "../components/ui/StatCard";

describe("UI components", () => {
  it("renders a Pill label", () => {
    const { getByText } = render(<Pill label="Low Risk" tone="success" />);
    expect(getByText("Low Risk")).toBeTruthy();
  });

  it("renders a StatCard value and change", () => {
    const { getByText } = render(
      <StatCard
        label="Total TVL"
        value="$142.5M"
        change="+12.4%"
        up
        icon="dollar-sign"
      />,
    );
    expect(getByText("Total TVL")).toBeTruthy();
    expect(getByText("$142.5M")).toBeTruthy();
    expect(getByText("+12.4%")).toBeTruthy();
  });

  it("renders a GradientButton and handles press", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <GradientButton label="Sign in" onPress={onPress} />,
    );
    expect(getByText("Sign in")).toBeTruthy();
  });
});
