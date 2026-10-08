"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Service } from "@prisma/client";

interface ServicesListClientProps {
  services: Service[];
  deletedServices: Service[];
}

export default function ServicesListClient({ services, deletedServices }: ServicesListClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
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

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deletedAt: null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to restore service");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to restore service");
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
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Slug:</span> {service.slug}
                </p>
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
                  onClick={() => handleDeleteClick(service.id, service.title)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                This will soft-delete the service. You can restore it later from the list.
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deleted Services Section */}
      {deletedServices.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Deleted Services ({deletedServices.length})
          </h3>
          <div className="space-y-4">
            {deletedServices.map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-75"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.title}</h4>
                    <p className="text-sm text-gray-600">{service.shortDesc}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Deleted: {service.deletedAt ? new Date(service.deletedAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(service.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
