"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Service } from "@prisma/client";

interface ServicesListClientProps {
  services: Service[];
}

export default function ServicesListClient({ services }: ServicesListClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This can be undone by restoring it.`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete service");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete service");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    setPublishing(id);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !currentlyPublished }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update service");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update service");
    } finally {
      setPublishing(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/services/${id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to duplicate service");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to duplicate service");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setReordering(true);
    try {
      const response = await fetch(`/api/admin/services/${id}/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reorder service");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reorder service");
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-900"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {service.title}
                </h3>
                {service.published ? (
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Published
                  </span>
                ) : (
                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Draft
                  </span>
                )}
                {service.featured && (
                  <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {service.badgeText && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {service.badgeText}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{service.shortDesc}</p>
              {service.slug && (
                <p className="text-sm text-gray-500 font-mono">/services/{service.slug}</p>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {service.priceLabel}
              </div>
              <div className="text-sm text-gray-500">
                Order: {service.sortOrder}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-3">
                <Link
                  href={`/admin/services/${service.id}`}
                  className="text-gray-900 hover:text-gray-700 font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(service.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleTogglePublish(service.id, service.published)}
                  disabled={publishing === service.id}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  {publishing === service.id ? "..." : service.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleReorder(service.id, "up")}
                  disabled={reordering || index === 0}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleReorder(service.id, "down")}
                  disabled={reordering || index === services.length - 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.title)}
                  disabled={deleting === service.id}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deleting === service.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <div className="text-gray-500">
                Updated: {new Date(service.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
