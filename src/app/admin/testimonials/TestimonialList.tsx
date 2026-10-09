"use client";

import { useState } from "react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  link: string | null;
  sortOrder: number;
  published: boolean;
}

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialList({ testimonials: initialTestimonials }: Props) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleTogglePublish = async (id: string, published: boolean) => {
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });

    if (response.ok) {
      setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, published: !published } : t)));
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = testimonials.findIndex((t) => t.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === testimonials.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newTestimonials = [...testimonials];
    [newTestimonials[index], newTestimonials[newIndex]] = [newTestimonials[newIndex], newTestimonials[index]];

    const updates = newTestimonials.map((t, idx) => ({
      id: t.id,
      sortOrder: idx,
    }));

    const response = await fetch("/api/admin/testimonials/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    if (response.ok) {
      setTestimonials(newTestimonials);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-4">No testimonials yet</p>
        <p className="text-sm text-gray-500 mb-4">The testimonials section is hidden on the public site when empty.</p>
        <Link
          href="/admin/testimonials/new"
          className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add your first testimonial
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {testimonials.map((testimonial, index) => (
        <div
          key={testimonial.id}
          className="border-b border-gray-200 last:border-b-0 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    testimonial.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {testimonial.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-gray-600 italic mb-3">"{testimonial.quote}"</p>
              <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
              <p className="text-xs text-gray-600">{testimonial.role}</p>
              {testimonial.link && (
                <a
                  href={testimonial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:underline"
                >
                  {testimonial.link}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMove(testimonial.id, "up")}
                disabled={index === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(testimonial.id, "down")}
                disabled={index === testimonials.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => handleTogglePublish(testimonial.id, testimonial.published)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {testimonial.published ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/admin/testimonials/${testimonial.id}`}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </Link>
              {deleteConfirm === testimonial.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
                  onClick={() => setDeleteConfirm(testimonial.id)}
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
