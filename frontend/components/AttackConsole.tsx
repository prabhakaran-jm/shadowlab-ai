"use client";

export default function AttackConsole({ logs }: { logs: string[] }) {
  return (
    <section className="rounded-lg border border-gray-700 bg-gray-900 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-green-400 mb-2">
        Live Attack Console
      </h3>
      <div className="font-mono text-sm text-green-400 max-h-60 overflow-y-auto rounded border border-gray-700 bg-black/40 p-3">
        {logs.length === 0 ? (
          <span className="text-gray-500">Waiting for scan...</span>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="leading-relaxed">
              {line}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
