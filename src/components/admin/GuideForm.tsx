"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkflowStatusSelect from "./WorkflowStatusSelect";
import type { AdminRole } from "@/lib/roles";
import type { PublishStatus } from "@/lib/publishing";

type Section = {
  title: string;
  job: string;
  todaySteps: string;
  tryItDemoSlug: string;
  whatStaysHuman: string;
  todayText: string;
  years2to5Text: string;
  years5to10Text: string;
};

type SourceOption = { id: string; title: string; status: string };

const emptySection = (): Section => ({
  title: "",
  job: "",
  todaySteps: "",
  tryItDemoSlug: "",
  whatStaysHuman: "",
  todayText: "",
  years2to5Text: "",
  years5to10Text: "",
});

export default function GuideForm({
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
    title: string;
    slug: string;
    industry: string;
    summaryBox: string;
    rogerNote: string;
    rogerStory: string;
    seoTitle: string;
    seoDescription: string;
    reviewStamp: string;
    status: PublishStatus;
    sourceIds: string[];
    sections: Section[];
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [industry, setIndustry] = useState(initialData?.industry ?? "general");
  const [summaryBox, setSummaryBox] = useState(initialData?.summaryBox ?? "");
  const [rogerNote, setRogerNote] = useState(initialData?.rogerNote ?? "");
  const [rogerStory, setRogerStory] = useState(initialData?.rogerStory ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription ?? "");
  const [reviewStamp, setReviewStamp] = useState(initialData?.reviewStamp ?? "");
  const [status, setStatus] = useState<PublishStatus>(initialData?.status ?? "draft");
  const [sourceIds, setSourceIds] = useState<string[]>(initialData?.sourceIds ?? []);
  const [sections, setSections] = useState<Section[]>(
    initialData?.sections?.length ? initialData.sections : [emptySection()]
  );

  const toggleSource = (id: string) => {
    setSourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        slug,
        industry,
        summaryBox,
        rogerNote,
        rogerStory,
        seoTitle,
        seoDescription,
        reviewStamp,
        status,
        sourceIds,
        sections,
      };
      const url = mode === "create" ? "/api/admin/guides" : `/api/admin/guides/${initialData?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save guide");
      }
      router.push("/admin/guides");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save guide");
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 font-mono text-sm"
        />
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary box *</label>
        <textarea
          required
          rows={3}
          value={summaryBox}
          onChange={(e) => setSummaryBox(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Roger&apos;s note</label>
        <textarea
          rows={3}
          value={rogerNote}
          onChange={(e) => setRogerNote(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Roger&apos;s story</label>
        <textarea
          rows={3}
          value={rogerStory}
          onChange={(e) => setRogerStory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review stamp note</label>
        <input
          value={reviewStamp}
          onChange={(e) => setReviewStamp(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300"
          placeholder="One line on what Roger changed"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO title</label>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO description</label>
          <input
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
      </div>

      <WorkflowStatusSelect value={status} onChange={setStatus} role={role} />

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Linked sources</p>
        <div className="space-y-2 max-h-48 overflow-auto border border-gray-200 p-3">
          {sources.length === 0 ? (
            <p className="text-sm text-gray-500">No sources yet.</p>
          ) : (
            sources.map((source) => (
              <label key={source.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sourceIds.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                />
                <span>{source.title}</span>
                <span className="text-gray-500">({source.status})</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
          <button
            type="button"
            onClick={() => setSections((prev) => [...prev, emptySection()])}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            + Add section
          </button>
        </div>
        {sections.map((section, index) => (
          <div key={index} className="border border-gray-200 p-4 space-y-3">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Section {index + 1}</p>
              {sections.length > 1 ? (
                <button
                  type="button"
                  className="text-xs text-red-700"
                  onClick={() =>
                    setSections((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
            {(
              [
                ["title", "Title"],
                ["job", "The job"],
                ["todaySteps", "Today steps"],
                ["tryItDemoSlug", "Try-it demo slug"],
                ["whatStaysHuman", "What stays human"],
                ["todayText", "Today"],
                ["years2to5Text", "2–5 years"],
                ["years5to10Text", "5–10 years"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                </label>
                {key === "title" || key === "tryItDemoSlug" ? (
                  <input
                    value={section[key]}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, [key]: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                  />
                ) : (
                  <textarea
                    rows={2}
                    value={section[key]}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, [key]: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link href="/admin/guides" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Guide" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
