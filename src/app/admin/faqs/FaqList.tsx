"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

interface Props {
  faqs: Faq[];
}

export default function FaqList({ faqs: initialFaqs }: Props) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const handleTogglePublish = async (id: string, published: boolean) => {
    const response = await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });

    if (response.ok) {
      setFaqs(faqs.map((f) => (f.id === id ? { ...f, published: !published } : f)));
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/faqs/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setFaqs(faqs.filter((f) => f.id !== id));
      setDeleteConfirm(null);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = faqs.findIndex((f) => f.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqs.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];

    const updates = newFaqs.map((faq, idx) => ({
      id: faq.id,
      sortOrder: idx,
    }));

    const response = await fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    if (response.ok) {
      setFaqs(newFaqs);
    }
  };

  if (faqs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-4">No FAQs yet</p>
        <Link
          href="/admin/faqs/new"
          className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add your first FAQ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="border-b border-gray-200 last:border-b-0 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    faq.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {faq.published ? "Published" : "Draft"}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMove(faq.id, "up")}
                disabled={index === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(faq.id, "down")}
                disabled={index === faqs.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => handleTogglePublish(faq.id, faq.published)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {faq.published ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/admin/faqs/${faq.id}`}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </Link>
              {deleteConfirm === faq.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(faq.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
