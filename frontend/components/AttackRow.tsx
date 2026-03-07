"use client";

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
    <tr
      className={
        isFail
          ? "bg-red-50 border-b border-red-100"
          : "bg-green-50 border-b border-green-100"
      }
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {result.attack_type}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
        {truncate(result.prompt, PROMPT_TRUNCATE)}
      </td>
      <td className="px-4 py-3">
        <span
          className={
            isFail
              ? "text-red-700 font-semibold"
              : "text-green-700 font-semibold"
          }
        >
          {result.verdict}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{result.severity}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{result.reason}</td>
    </tr>
  );
}
