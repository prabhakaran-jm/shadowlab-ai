"use client";

import { Terminal, Loader2 } from "lucide-react";

interface AttackConsoleProps {
  scanState: "idle" | "loading" | "done";
  totalTests?: number;
  failedTests?: number;
  rounds?: number;
}

export default function AttackConsole({
  scanState,
  totalTests,
  failedTests,
  rounds,
}: AttackConsoleProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/90 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-lg shadow-black/20 hover-lift">
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/10 bg-black/40">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">
          Scan Status
        </h3>
        {scanState === "loading" && (
          <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>
      <div className="font-mono text-sm text-emerald-400/90 p-4 bg-black/40">
        {scanState === "idle" && (
          <span className="text-zinc-500">Waiting for scan...</span>
        )}
        {scanState === "loading" && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <div>
              <p className="text-emerald-400">Running adversarial scan...</p>
              <p className="text-zinc-500 text-xs mt-1">
                Generating attacks, probing target, analyzing responses with Gradient AI.
                This typically takes 15-30 seconds.
              </p>
            </div>
          </div>
        )}
        {scanState === "done" && totalTests !== undefined && (
          <div className="space-y-1">
            <p className="text-emerald-400">Scan complete.</p>
            <p className="text-zinc-400">
              {totalTests} tests executed{rounds && rounds > 1 ? ` across ${rounds} rounds` : ""} &mdash;{" "}
              <span className={failedTests && failedTests > 0 ? "text-red-400" : "text-emerald-400"}>
                {failedTests} vulnerabilit{failedTests === 1 ? "y" : "ies"} found
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
