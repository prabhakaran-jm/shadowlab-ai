"use client";

import { useState, useEffect, useRef } from "react";
import ScanForm from "@/components/ScanForm";
import ScanResults from "@/components/ScanResults";
import AttackConsole from "@/components/AttackConsole";
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            ShadowLab – AI Adversarial API Tester
          </h1>
          <p className="mt-2 text-gray-600">
            Chaos engineering for AI APIs
          </p>
          <p className="mt-1 text-sm font-medium text-indigo-600">
            Powered by DigitalOcean Gradient™ AI
          </p>
        </header>

        <ScanForm
          onResult={setResult}
          onLoading={setLoading}
          onError={setError}
          setLogs={setLogs}
        />

        {loading && (
          <>
            <AttackConsole logs={logs} />
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 text-center text-gray-600">
              Running adversarial tests...
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {result && !loading && <ScanResults result={result} />}
      </div>
    </div>
  );
}
