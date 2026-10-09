"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SourceStatus } from "@/lib/publishing";

export default function SourceForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    publisher: string;
    publishedDate: string;
    url: string;
    exactClaim: string;
    notes: string;
    status: SourceStatus;
    nextReviewAt: string;
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    publisher: initialData?.publisher ?? "",
    publishedDate: initialData?.publishedDate ?? "",
    url: initialData?.url ?? "",
    exactClaim: initialData?.exactClaim ?? "",
    notes: initialData?.notes ?? "",
    status: (initialData?.status ?? "to_verify") as SourceStatus,
    nextReviewAt: initialData?.nextReviewAt ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/sources" : `/api/admin/sources/${initialData?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save source");
      router.push("/admin/sources");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save source");
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
      {(
        [
          ["title", "Title *"],
          ["publisher", "Publisher *"],
          ["publishedDate", "Date"],
          ["url", "URL *"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            required={label.includes("*")}
            value={form[key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exact claim used</label>
        <textarea
          rows={3}
          value={form.exactClaim}
          onChange={(e) => setForm((prev) => ({ ...prev, exactClaim: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, status: e.target.value as SourceStatus }))
          }
          className="w-full px-4 py-2 border border-gray-300"
        >
          <option value="to_verify">To verify</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          New sources default to to-verify. Linked guides and timeline entries cannot publish while any linked source is still to-verify.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Next review date</label>
        <input
          type="date"
          value={form.nextReviewAt}
          onChange={(e) => setForm((prev) => ({ ...prev, nextReviewAt: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link href="/admin/sources" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Source" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
