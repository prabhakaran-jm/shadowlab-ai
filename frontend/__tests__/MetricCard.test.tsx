import { render, screen } from "@testing-library/react";
import { ShieldAlert } from "lucide-react";
import MetricCard from "@/components/MetricCard";

describe("MetricCard", () => {
  it("renders label and count", () => {
    render(
      <MetricCard
        label="Prompt Injection"
        count={2}
        icon={ShieldAlert}
        accent="red"
      />
    );
    expect(screen.getByText("Prompt Injection")).toBeInTheDocument();
    expect(screen.getByText("2 detected")).toBeInTheDocument();
  });

  it("shows 0 detected when count is zero", () => {
    render(
      <MetricCard
        label="Policy Bypass"
        count={0}
        icon={ShieldAlert}
        accent="purple"
      />
    );
    expect(screen.getByText("0 detected")).toBeInTheDocument();
  });
});
