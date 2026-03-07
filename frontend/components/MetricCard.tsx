"use client";

import { LucideIcon } from "lucide-react";

type Accent = "red" | "amber" | "purple";

interface MetricCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  accent: Accent;
}

const ACCENT_STYLES: Record<
  Accent,
  { border: string; bg: string; text: string; shadow: string }
> = {
  red: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    text: "text-red-400",
    shadow: "shadow-[0_0_20px_rgba(239,68,68,0.04)]",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    shadow: "shadow-[0_0_20px_rgba(245,158,11,0.04)]",
  },
  purple: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    text: "text-violet-400",
    shadow: "shadow-[0_0_20px_rgba(139,92,246,0.04)]",
  },
};

export default function MetricCard({ label, count, icon: Icon, accent }: MetricCardProps) {
  const hasFindings = count > 0;
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`rounded-xl border backdrop-blur-md p-3.5 transition-all duration-200 hover-lift ${
        hasFindings
          ? `${styles.border} ${styles.bg} ${styles.shadow}`
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="w-4 h-4 flex-shrink-0 opacity-90" />
        <span className="text-xs font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p
        className={`mt-1.5 text-xl font-bold tabular-nums ${
          hasFindings ? styles.text : "text-zinc-200"
        }`}
      >
        {count} detected
      </p>
    </div>
  );
}
