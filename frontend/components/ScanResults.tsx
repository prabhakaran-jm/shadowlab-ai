"use client";

import { useState } from "react";
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
  rounds?: number;
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

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

type SeverityFilter = "all" | "high" | "medium" | "low";

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
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const filtered = results
    .filter((r) => filter === "all" || r.severity === filter)
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));

  const filterButtons: { label: string; value: SeverityFilter; color: string }[] = [
    { label: "All", value: "all", color: "text-zinc-400 border-zinc-700 bg-zinc-800/50" },
    { label: "High", value: "high", color: "text-red-400 border-red-500/30 bg-red-500/10" },
    { label: "Medium", value: "medium", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { label: "Low", value: "low", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Findings
          </h3>
        </div>
        <div className="flex gap-1.5">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                filter === btn.value
                  ? btn.color
                  : "text-zinc-600 border-zinc-800 bg-transparent hover:border-zinc-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-zinc-600 text-sm py-4 text-center">
            No findings match the selected filter.
          </p>
        ) : (
          filtered.map((row, i) => <AttackRow key={i} result={row} />)
        )}
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
          rounds={result.rounds}
        />
      )}

      <VulnerabilitySummarySection result={result} />

      <FindingsSection results={result.results} />

      <RemediationsBlock fixes={fixes} />
    </div>
  );
}
