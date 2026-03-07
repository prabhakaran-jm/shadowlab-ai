import { render, screen } from "@testing-library/react";
import {
  countByAttackType,
  getUniqueFixes,
  VulnerabilitySummarySection,
  FindingsSection,
} from "@/components/ScanResults";
import type { AttackResultType } from "@/components/AttackRow";
import type { ScanResultType } from "@/components/ScanResults";

describe("countByAttackType", () => {
  it("counts only failed results by attack type", () => {
    const results: AttackResultType[] = [
      {
        attack_type: "prompt_injection",
        verdict: "fail",
        prompt: "",
        response_excerpt: "",
        severity: "high",
        reason: "",
        suggested_fix: "",
      },
      {
        attack_type: "prompt_injection",
        verdict: "fail",
        prompt: "",
        response_excerpt: "",
        severity: "high",
        reason: "",
        suggested_fix: "",
      },
      {
        attack_type: "policy_bypass",
        verdict: "pass",
        prompt: "",
        response_excerpt: "",
        severity: "low",
        reason: "",
        suggested_fix: null,
      },
    ];
    const counts = countByAttackType(results);
    expect(counts.prompt_injection).toBe(2);
    expect(counts.policy_bypass).toBe(0);
    expect(counts.system_prompt_extraction).toBe(0);
  });
});

describe("getUniqueFixes", () => {
  it("returns unique non-empty suggested fixes", () => {
    const results: AttackResultType[] = [
      {
        attack_type: "a",
        prompt: "",
        response_excerpt: "",
        verdict: "fail",
        severity: "high",
        reason: "",
        suggested_fix: "Fix A",
      },
      {
        attack_type: "b",
        prompt: "",
        response_excerpt: "",
        verdict: "fail",
        severity: "high",
        reason: "",
        suggested_fix: "Fix A",
      },
      {
        attack_type: "c",
        prompt: "",
        response_excerpt: "",
        verdict: "fail",
        severity: "high",
        reason: "",
        suggested_fix: "Fix B",
      },
      {
        attack_type: "d",
        prompt: "",
        response_excerpt: "",
        verdict: "fail",
        severity: "high",
        reason: "",
        suggested_fix: null,
      },
    ];
    const fixes = getUniqueFixes(results);
    expect(fixes).toHaveLength(2);
    expect(fixes).toContain("Fix A");
    expect(fixes).toContain("Fix B");
  });

  it("returns empty array when no fixes", () => {
    const results: AttackResultType[] = [
      {
        attack_type: "a",
        prompt: "",
        response_excerpt: "",
        verdict: "fail",
        severity: "high",
        reason: "",
        suggested_fix: null,
      },
    ];
    expect(getUniqueFixes(results)).toEqual([]);
  });
});

describe("VulnerabilitySummarySection", () => {
  it("renders Vulnerability summary and metric cards", () => {
    const result: ScanResultType = {
      total_tests: 3,
      failed_tests: 0,
      safety_score: 100,
      results: [],
      gradient_used: false,
    };
    render(<VulnerabilitySummarySection result={result} />);
    expect(screen.getByText("Vulnerability summary")).toBeInTheDocument();
    expect(screen.getByText("Prompt Injection")).toBeInTheDocument();
    expect(screen.getByText("System Prompt Extraction")).toBeInTheDocument();
    expect(screen.getByText("Policy Bypass")).toBeInTheDocument();
  });
});

describe("FindingsSection", () => {
  it("renders Findings heading and attack rows", () => {
    const results: AttackResultType[] = [
      {
        attack_type: "prompt_injection",
        prompt: "test",
        response_excerpt: "ok",
        verdict: "pass",
        severity: "low",
        reason: "No issues",
        suggested_fix: null,
      },
    ];
    render(<FindingsSection results={results} />);
    expect(screen.getByText("Findings")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
