"use client";

import AttackRow, { type AttackResultType } from "./AttackRow";

export interface ScanResultType {
  total_tests: number;
  failed_tests: number;
  results: AttackResultType[];
}

export default function ScanResults({ result }: { result: ScanResultType }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Scan results
      </h2>
      <div className="flex gap-6 mb-4 text-sm">
        <span className="text-gray-600">
          Total tests: <strong>{result.total_tests}</strong>
        </span>
        <span className="text-gray-600">
          Failed:{" "}
          <strong className={result.failed_tests > 0 ? "text-red-600" : ""}>
            {result.failed_tests}
          </strong>
        </span>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Attack Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Verdict
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((row, i) => (
              <AttackRow key={i} result={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
