import { render, screen } from "@testing-library/react";
import AttackConsole from "@/components/AttackConsole";

describe("AttackConsole", () => {
  it("shows waiting message when logs are empty", () => {
    render(<AttackConsole logs={[]} />);
    expect(screen.getByText("Waiting for scan...")).toBeInTheDocument();
  });

  it("shows Live Attack Console heading", () => {
    render(<AttackConsole logs={[]} />);
    expect(screen.getByText("Live Attack Console")).toBeInTheDocument();
  });

  it("renders log lines when provided", () => {
    const logs = [
      "Starting scan...",
      "Running attack: prompt_injection",
      "Scan completed.",
    ];
    render(<AttackConsole logs={logs} />);
    expect(screen.getByText("Starting scan...")).toBeInTheDocument();
    expect(screen.getByText("Running attack: prompt_injection")).toBeInTheDocument();
    expect(screen.getByText("Scan completed.")).toBeInTheDocument();
  });
});
