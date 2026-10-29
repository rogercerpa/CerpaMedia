"use client";

import { useState } from "react";
import type { InsightStrategyCallCopy } from "@/lib/insight-strategy-call";

export default function InsightStrategyCallEditor({
  initial,
}: {
  initial: InsightStrategyCallCopy;
}) {
  const [copy, setCopy] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/insight-strategy-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to save");
      }
      setMessage({ type: "success", text: "Saved. The box updates on the next article view." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-900 mb-2">
          Headline
        </label>
        <input
          id="headline"
          value={copy.headline}
          onChange={(event) => setCopy({ ...copy, headline: event.target.value })}
          className="w-full border border-gray-300 px-3 py-2 text-gray-900"
          maxLength={160}
        />
      </div>
      <div>
        <label htmlFor="creditLine" className="block text-sm font-medium text-gray-900 mb-2">
          Credit line
        </label>
        <textarea
          id="creditLine"
          value={copy.creditLine}
          onChange={(event) => setCopy({ ...copy, creditLine: event.target.value })}
          className="w-full border border-gray-300 px-3 py-2 text-gray-900 min-h-24"
          maxLength={400}
        />
        <p className="text-sm text-gray-500 mt-2">
          Keep the 30-day AI Teammate Launch credit. The button always goes to /consult.
          The founding spots line comes from Stripe and stays hidden when that count is unavailable.
        </p>
      </div>
      <div>
        <label htmlFor="buttonLabel" className="block text-sm font-medium text-gray-900 mb-2">
          Button label
        </label>
        <input
          id="buttonLabel"
          value={copy.buttonLabel}
          onChange={(event) => setCopy({ ...copy, buttonLabel: event.target.value })}
          className="w-full border border-gray-300 px-3 py-2 text-gray-900"
          maxLength={80}
        />
      </div>
      {message ? (
        <p className={message.type === "success" ? "text-sm text-green-700" : "text-sm text-red-700"}>
          {message.text}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
