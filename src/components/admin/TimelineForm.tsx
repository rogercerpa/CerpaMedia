"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkflowStatusSelect from "./WorkflowStatusSelect";
import type { AdminRole } from "@/lib/roles";
import type { PublishStatus } from "@/lib/publishing";

type SourceOption = { id: string; title: string; status: string };

export default function TimelineForm({
  mode,
  role,
  sources,
  initialData,
}: {
  mode: "create" | "edit";
  role: AdminRole;
  sources: SourceOption[];
  initialData?: {
    id: string;
    timeframe: string;
    industry: string;
    title: string;
    text: string;
    status: PublishStatus;
    sourceIds: string[];
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(initialData?.timeframe ?? "today");
  const [industry, setIndustry] = useState(initialData?.industry ?? "general");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [text, setText] = useState(initialData?.text ?? "");
  const [status, setStatus] = useState<PublishStatus>(initialData?.status ?? "draft");
  const [sourceIds, setSourceIds] = useState<string[]>(initialData?.sourceIds ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url =
        mode === "create"
          ? "/api/admin/timeline"
          : `/api/admin/timeline/${initialData?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe, industry, title, text, status, sourceIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save entry");
      router.push("/admin/timeline");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : null}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        >
          <option value="today">Today</option>
          <option value="2-5">2–5 years</option>
          <option value="5-10">5–10 years</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        >
          <option value="general">General</option>
          <option value="home-services">Home services</option>
          <option value="professional-services">Professional services</option>
          <option value="local-services">Local services</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text *</label>
        <textarea
          required
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <WorkflowStatusSelect value={status} onChange={setStatus} role={role} />
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Linked sources</p>
        <div className="space-y-2 max-h-48 overflow-auto border border-gray-200 p-3">
          {sources.map((source) => (
            <label key={source.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sourceIds.includes(source.id)}
                onChange={() =>
                  setSourceIds((prev) =>
                    prev.includes(source.id)
                      ? prev.filter((id) => id !== source.id)
                      : [...prev, source.id]
                  )
                }
              />
              <span>{source.title}</span>
              <span className="text-gray-500">({source.status})</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link href="/admin/timeline" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Entry" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
