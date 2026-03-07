import { render, screen } from "@testing-library/react";
import RemediationsBlock from "@/components/RemediationsBlock";

describe("RemediationsBlock", () => {
  it("returns null when fixes array is empty", () => {
    const { container } = render(<RemediationsBlock fixes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Remediations heading when fixes are provided", () => {
    render(<RemediationsBlock fixes={["Add input validation."]} />);
    expect(screen.getByText("Remediations")).toBeInTheDocument();
  });

  it("renders each fix with numbering", () => {
    const fixes = ["First fix.", "Second fix."];
    render(<RemediationsBlock fixes={fixes} />);
    expect(screen.getByText("First fix.")).toBeInTheDocument();
    expect(screen.getByText("Second fix.")).toBeInTheDocument();
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
  });

  it("shows fix playbook description", () => {
    render(<RemediationsBlock fixes={["A fix."]} />);
    expect(
      screen.getByText(/Fix playbook — apply these changes to harden your API/i)
    ).toBeInTheDocument();
  });
});
