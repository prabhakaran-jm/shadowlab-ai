import { render, screen } from "@testing-library/react";
import AttackConsole from "@/components/AttackConsole";

describe("AttackConsole", () => {
  it("shows waiting message when scan state is idle", () => {
    render(<AttackConsole scanState="idle" />);
    expect(screen.getByText("Waiting for scan...")).toBeInTheDocument();
  });

  it("shows Scan Status heading", () => {
    render(<AttackConsole scanState="idle" />);
    expect(screen.getByText("Scan Status")).toBeInTheDocument();
  });

  it("shows loading spinner and message when scan state is loading", () => {
    render(<AttackConsole scanState="loading" />);
    expect(screen.getByText("Running adversarial scan...")).toBeInTheDocument();
    expect(
      screen.getByText(/This typically takes 15-30 seconds/i)
    ).toBeInTheDocument();
  });

  it("shows scan complete summary when scan state is done", () => {
    render(
      <AttackConsole
        scanState="done"
        totalTests={9}
        failedTests={2}
        rounds={1}
      />
    );
    expect(screen.getByText("Scan complete.")).toBeInTheDocument();
    expect(screen.getByText(/9 tests executed/)).toBeInTheDocument();
    expect(screen.getByText(/2 vulnerabilities found/)).toBeInTheDocument();
  });

  it("shows round count when more than 1 round", () => {
    render(
      <AttackConsole
        scanState="done"
        totalTests={12}
        failedTests={3}
        rounds={2}
      />
    );
    expect(screen.getByText(/across 2 rounds/)).toBeInTheDocument();
  });

  it("shows singular vulnerability text for 1 failure", () => {
    render(
      <AttackConsole
        scanState="done"
        totalTests={3}
        failedTests={1}
        rounds={1}
      />
    );
    expect(screen.getByText(/1 vulnerability found/)).toBeInTheDocument();
  });
});
