"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export default function AttackConsole({ logs }: { logs: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current?.scrollIntoView && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/90 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-lg shadow-black/20 hover-lift">
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/10 bg-black/40">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">
          Live Attack Console
        </h3>
        <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="font-mono text-sm text-emerald-400/90 max-h-56 overflow-y-auto p-4 scrollbar-thin bg-black/40">
        {logs.length === 0 ? (
          <span className="text-zinc-500">Waiting for scan...</span>
        ) : (
          <>
            {logs.map((line, i) => (
              <div key={i} className="leading-relaxed">
                {line}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </section>
  );
}
