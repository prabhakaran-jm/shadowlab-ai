"use client";

import { ShieldAlert, ScanSearch, Lock, AlertTriangle, Terminal } from "lucide-react";
import AttackRow, { type AttackResultType } from "./AttackRow";
import MetricCard from "./MetricCard";
import RemediationsBlock from "./RemediationsBlock";
import SafetyScoreGauge from "./SafetyScoreGauge";

export interface ScanResultType {
  total_tests: number;
  failed_tests: number;
  safety_score: number;
  results: AttackResultType[];
  gradient_used?: boolean;
}

const ATTACK_KEYS = [
  "prompt_injection",
  "system_prompt_extraction",
  "policy_bypass",
] as const;

const METRIC_CONFIG: {
  key: (typeof ATTACK_KEYS)[number];
  label: string;
  icon: typeof ShieldAlert;
  accent: "red" | "amber" | "purple";
}[] = [
  { key: "prompt_injection", label: "Prompt Injection", icon: ShieldAlert, accent: "red" },
  { key: "system_prompt_extraction", label: "System Prompt Extraction", icon: ScanSearch, accent: "amber" },
  { key: "policy_bypass", label: "Policy Bypass", icon: Lock, accent: "purple" },
];

export function countByAttackType(results: AttackResultType[]): Record<string, number> {
  const counts: Record<string, number> = {
    prompt_injection: 0,
    system_prompt_extraction: 0,
    policy_bypass: 0,
  };
  for (const r of results) {
    if (r.verdict === "fail" && r.attack_type in counts) {
      counts[r.attack_type] += 1;
    }
  }
  return counts;
}

export function getUniqueFixes(results: AttackResultType[]): string[] {
  const fixes = results
    .map((r) => r.suggested_fix)
    .filter((f): f is string => Boolean(f?.trim()));
  return Array.from(new Set(fixes));
}

export function VulnerabilitySummarySection({ result }: { result: ScanResultType }) {
  const counts = countByAttackType(result.results);
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-2">
        <AlertTriangle className="w-4 h-4 text-zinc-500" />
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Vulnerability summary
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {METRIC_CONFIG.map(({ key, label, icon, accent }) => (
          <MetricCard
            key={key}
            label={label}
            count={counts[key] ?? 0}
            icon={icon}
            accent={accent}
          />
        ))}
      </div>
    </section>
  );
}

export function FindingsSection({ results }: { results: AttackResultType[] }) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-2">
        <Terminal className="w-4 h-4 text-zinc-500" />
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Findings
        </h3>
      </div>
      <div className="space-y-4">
        {results.map((row, i) => (
          <AttackRow key={i} result={row} />
        ))}
      </div>
    </section>
  );
}

export default function ScanResults({
  result,
  showSafetyScore = true,
}: {
  result: ScanResultType;
  showSafetyScore?: boolean;
}) {
  const counts = countByAttackType(result.results);
  const fixes = getUniqueFixes(result.results);

  return (
    <div className="space-y-5 animate-fade-in">
      {showSafetyScore && (
        <SafetyScoreGauge
          score={result.safety_score}
          gradientUsed={result.gradient_used}
        />
      )}

      <VulnerabilitySummarySection result={result} />

      <FindingsSection results={result.results} />

      <RemediationsBlock fixes={fixes} />
    </div>
  );
}
