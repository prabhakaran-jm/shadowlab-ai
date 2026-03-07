"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface AttackResultType {
  attack_type: string;
  prompt: string;
  response_excerpt: string;
  verdict: string;
  severity: string;
  reason: string;
  suggested_fix?: string | null;
}

const PROMPT_TRUNCATE = 80;

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export default function AttackRow({ result }: { result: AttackResultType }) {
  const isFail = result.verdict === "fail";

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all duration-200 hover-lift ${
        isFail
          ? "border-red-500/25 bg-red-500/5 shadow-[0_0_24px_rgba(239,68,68,0.06)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Top row: attack type + icon + verdict/severity badges */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {result.attack_type.replace(/_/g, " ")}
        </span>
        {isFail ? (
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-500/80 flex-shrink-0" />
        )}
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
            isFail
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {result.verdict}
        </span>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-500">
          {result.severity}
        </span>
      </div>
      {/* Middle: code-style prompt block */}
      <div className="font-mono text-xs text-zinc-400 bg-black/50 rounded-lg px-3 py-2 mb-2 border border-white/5 overflow-x-auto">
        <span className="text-zinc-500 select-none">$ </span>
        {truncate(result.prompt, PROMPT_TRUNCATE)}
      </div>
      {/* Bottom: reason */}
      <p className="text-xs text-zinc-300 leading-relaxed mt-2">{result.reason}</p>
    </div>
  );
}
