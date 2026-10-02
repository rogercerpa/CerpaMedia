"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSlug } from "@/lib/insight-draft";

interface InsightFormData {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags: string;
  status: "draft" | "published";
}

interface InsightFormProps {
  initialData?: InsightFormData;
  mode: "create" | "edit";
}

export default function InsightForm({ initialData, mode }: InsightFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<InsightFormData>(
    initialData || {
      title: "",
      slug: "",
      summary: "",
      body: "",
      tags: "",
      status: "draft",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit" && !!initialData?.slug
  );

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        body: formData.body,
        tags,
        status: formData.status,
      };

      const url =
        mode === "create"
          ? "/api/admin/insights"
          : `/api/admin/insights/${formData.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save post");
      }

      router.push("/admin/insights");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="e.g., How AI is Transforming Small Business Operations"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Slug (URL path) *
        </label>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">/insights/</span>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
            placeholder="how-ai-is-transforming-small-business"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-generated from title, but you can edit it
        </p>
      </div>

      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Summary *
        </label>
        <textarea
          id="summary"
          required
          value={formData.summary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, summary: e.target.value }))
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Brief summary shown in the list and at the top of the post"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Body (Markdown) *
        </label>
        <textarea
          id="body"
          required
          value={formData.body}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, body: e.target.value }))
          }
          rows={20}
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
          placeholder="Full post content in Markdown format..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports Markdown: **bold**, *italic*, [link](url), ## Heading, etc.
        </p>
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tags: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="AI, automation, SMB, technology (comma-separated)"
        />
        <p className="mt-1 text-xs text-gray-500">
          Comma-separated tags. Example: AI, automation, SMB
        </p>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status *
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as "draft" | "published",
            }))
          }
          className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Published posts appear on /insights and set publishedAt if empty
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link
          href="/admin/insights"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
