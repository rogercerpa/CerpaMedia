"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

interface Props {
  faq?: Faq | null;
}

export default function FaqForm({ faq }: Props) {
  const [formData, setFormData] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    published: faq?.published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = faq ? `/api/admin/faqs/${faq.id}` : "/api/admin/faqs";
      const method = faq ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      router.push("/admin/faqs");
      router.refresh();
    } catch (err) {
      setError("Failed to save FAQ");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question
        </label>
        <input
          type="text"
          required
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer
        </label>
        <textarea
          required
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
          Published
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : faq ? "Update FAQ" : "Create FAQ"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
