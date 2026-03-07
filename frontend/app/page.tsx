"use client";

import { useState, useEffect, useRef } from "react";
import ScanForm from "@/components/ScanForm";
import {
  FindingsSection,
  VulnerabilitySummarySection,
  getUniqueFixes,
} from "@/components/ScanResults";
import AttackConsole from "@/components/AttackConsole";
import SafetyScoreGauge from "@/components/SafetyScoreGauge";
import RemediationsBlock from "@/components/RemediationsBlock";
import type { ScanResultType } from "@/components/ScanResults";

const SIMULATED_ATTACKS = [
  "Running attack: prompt_injection",
  "Running attack: system_prompt_extraction",
  "Running attack: policy_bypass",
];

export default function Home() {
  const [result, setResult] = useState<ScanResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!loading) return;
    const delays = [800, 1800, 2800];
    timeoutRefs.current = delays.map((delay, i) =>
      setTimeout(() => {
        setLogs((prev) => [...prev, SIMULATED_ATTACKS[i]]);
      }, delay)
    );
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [loading]);

  return (
    <div className="min-h-screen bg-[#0f0f12] text-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6 py-5 sm:py-6">
        <header className="text-center space-y-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            ShadowLab
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 font-medium">
            Chaos engineering for AI APIs
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-indigo-400/95 shadow-sm">
            Powered by DigitalOcean Gradient™ AI
          </div>
          <p className="text-xs text-zinc-500 max-w-xl mx-auto">
            Automatically uncover adversarial failures before they reach production.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-6 flex flex-col">
            <ScanForm
              onResult={setResult}
              onLoading={setLoading}
              onError={setError}
              setLogs={setLogs}
            />
            {result && !loading && (
              <FindingsSection results={result.results} />
            )}
          </div>
          <div className="xl:col-span-5 space-y-6 flex flex-col">
            {result && !loading ? (
              <>
                <SafetyScoreGauge
                  score={result.safety_score}
                  gradientUsed={result.gradient_used}
                />
                {!result.gradient_used && (
                  <p className="text-xs text-amber-500/90 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                    This run used seed attacks. Set <code className="text-amber-400/90">GRADIENT_MODEL_ACCESS_KEY</code> on the backend for Gradient AI–generated attacks and analysis.
                  </p>
                )}
                <VulnerabilitySummarySection result={result} />
                <RemediationsBlock fixes={getUniqueFixes(result.results)} />
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex items-center justify-center min-h-[180px] text-zinc-500 text-sm h-full">
                Run a scan to see your security score.
              </div>
            )}
          </div>
        </div>

        {loading && (
          <>
            <AttackConsole logs={logs} />
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 text-center text-zinc-400 text-sm transition-all duration-300 mt-6">
              Running adversarial tests...
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm mt-6">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
