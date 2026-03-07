"use client";

import { ShieldCheck } from "lucide-react";

interface RemediationsBlockProps {
  fixes: string[];
}

export default function RemediationsBlock({ fixes }: RemediationsBlockProps) {
  if (fixes.length === 0) return null;

  return (
    <section className="rounded-xl border border-emerald-500/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-300 shadow-lg shadow-black/20 hover-lift">
      <div className="flex items-center gap-2.5 mb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500/90" />
        <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
          Remediations
        </h3>
      </div>
      <p className="text-xs text-zinc-500 mb-2">Fix playbook — apply these changes to harden your API.</p>
      <div className="space-y-3">
        {fixes.map((fix, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-lg border border-emerald-500/15 bg-black/30 px-4 py-2 font-mono text-xs text-zinc-300 leading-relaxed transition-colors hover:border-emerald-500/25"
          >
            <span className="text-emerald-500/90 flex-shrink-0 select-none font-semibold">
              {i + 1}.
            </span>
            <span>{fix}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
