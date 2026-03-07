"use client";

import React, { useState, FormEvent } from "react";
import { Zap } from "lucide-react";
import type { ScanResultType } from "./ScanResults";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

export default function ScanForm({
  onResult,
  onLoading,
  onError,
  setLogs,
}: {
  onResult: (result: ScanResultType) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string | null) => void;
  setLogs?: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [endpoint, setEndpoint] = useState("");
  const [description, setDescription] = useState("");
  const [bodyFormat, setBodyFormat] = useState<"message" | "messages">("message");
  const [targetModel, setTargetModel] = useState("");
  const [targetApiKey, setTargetApiKey] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onError(null);
    setLogs?.(["Starting ShadowLab scan..."]);
    setLogs?.((prev) => [...prev, "Launching adversarial attacks..."]);
    onLoading(true);

    const payload: Record<string, string | undefined> = {
      target_url: endpoint,
      target_description: description,
      target_body_format: bodyFormat,
    };
    if (targetModel.trim()) payload.target_model = targetModel.trim();
    if (targetApiKey.trim()) payload.target_authorization = "Bearer " + targetApiKey.trim();

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Scan failed");
      }

      const data: ScanResultType = await res.json();
      onResult(data);
      setLogs?.((prev) => [
        ...prev,
        "Scan completed.",
        "Safety score calculated.",
      ]);
    } catch {
      onError("Scan failed. Check API endpoint.");
    } finally {
      onLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 transition-all duration-300 shadow-lg shadow-black/20 hover-lift h-full min-h-[180px] flex flex-col"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <Zap className="w-5 h-5 text-amber-400/90" />
        <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
          New scan
        </h2>
      </div>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="endpoint"
            className="block text-sm font-medium text-zinc-400 mb-1"
          >
            API Endpoint
          </label>
          <input
            id="endpoint"
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-ai-api.example.com/chat"
            className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/25 outline-none transition-all hover:border-white/15 text-sm"
            required
          />
          <p className="mt-0.5 text-xs text-zinc-600">
            e.g. https://api.example.com/v1/chat or http://localhost:8000/mock-vulnerable-api
          </p>
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-400 mb-1"
          >
            Target Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the target API (e.g. chat assistant)"
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/25 outline-none transition-all resize-none hover:border-white/15 text-sm"
          />
          <p className="mt-0.5 text-xs text-zinc-600">
            Optional — used to tailor adversarial prompts when using Gradient AI.
          </p>
        </div>
        <div>
          <label
            htmlFor="bodyFormat"
            className="block text-sm font-medium text-zinc-400 mb-1"
          >
            Request body format
          </label>
          <select
            id="bodyFormat"
            value={bodyFormat}
            onChange={(e) => setBodyFormat(e.target.value as "message" | "messages")}
            className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-zinc-100 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/25 outline-none text-sm"
          >
            <option value="message">message (default)</option>
            <option value="messages">messages (OpenAI / Gradient)</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="targetModel"
            className="block text-sm font-medium text-zinc-400 mb-1"
          >
            Model (optional)
          </label>
          <input
            id="targetModel"
            type="text"
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            placeholder="e.g. llama3.3-70b-instruct"
            className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/25 outline-none text-sm"
          />
          <p className="mt-0.5 text-xs text-zinc-600">
            For OpenAI/Gradient endpoints when using messages format.
          </p>
        </div>
        <div>
          <label
            htmlFor="targetApiKey"
            className="block text-sm font-medium text-zinc-400 mb-1"
          >
            Target API key (optional)
          </label>
          <input
            id="targetApiKey"
            type="password"
            value={targetApiKey}
            onChange={(e) => setTargetApiKey(e.target.value)}
            placeholder="Bearer token for authenticated APIs"
            className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/25 outline-none text-sm"
          />
          <p className="mt-0.5 text-xs text-zinc-600">
            For real API demos (e.g. Gradient). Not stored; sent only with the scan request.
          </p>
        </div>
        <button
          type="submit"
          className="mt-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0f0f12] shadow-lg shadow-amber-500/10 hover:shadow-amber-400/20 hover:-translate-y-px active:translate-y-0"
        >
          Start Scan
        </button>
      </div>
    </form>
  );
}
