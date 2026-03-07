"use client";

import React, { useState, FormEvent } from "react";
import type { ScanResultType } from "./ScanResults";

const API_BASE = "http://localhost:8000";

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onError(null);
    setLogs?.(["Starting ShadowLab scan..."]);
    setLogs?.((prev) => [...prev, "Launching adversarial attacks..."]);
    onLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: endpoint,
          target_description: description,
        }),
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">New scan</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
            API Endpoint
          </label>
          <input
            id="endpoint"
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-ai-api.example.com/chat"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Target Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the target API (e.g. chat assistant)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Start Scan
        </button>
      </div>
    </form>
  );
}
