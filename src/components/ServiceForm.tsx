"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateServiceSlug } from "@/lib/service-slug";

interface ServiceFormData {
  id?: string;
  title: string;
  slug: string;
  shortDesc: string;
  description: string;
  outcome: string;
  priceLabel: string;
  price: string;
  priceNote: string;
  badgeText: string;
  featured: boolean;
  ctaLabel: string;
  ctaUrl: string;
  sortOrder: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

interface ServiceFormProps {
  initialData?: ServiceFormData;
  mode: "create" | "edit";
}

export default function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceFormData>(
    initialData || {
      title: "",
      slug: "",
      shortDesc: "",
      description: "",
      outcome: "",
      priceLabel: "",
      price: "",
      priceNote: "",
      badgeText: "",
      featured: false,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: "0",
      published: false,
      seoTitle: "",
      seoDescription: "",
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
      slug: slugManuallyEdited ? prev.slug : generateServiceSlug(value),
      seoTitle: prev.seoTitle || `${value} - CerpaMedia`,
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: generateServiceSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        shortDesc: formData.shortDesc,
        description: formData.description,
        outcome: formData.outcome || null,
        priceLabel: formData.priceLabel,
        price: formData.price ? parseFloat(formData.price) : null,
        priceNote: formData.priceNote || null,
        badgeText: formData.badgeText || null,
        featured: formData.featured,
        ctaLabel: formData.ctaLabel,
        ctaUrl: formData.ctaUrl,
        sortOrder: parseInt(formData.sortOrder, 10),
        published: formData.published,
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
      };

      const url =
        mode === "create"
          ? "/api/admin/services"
          : `/api/admin/services/${formData.id}`;
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
        throw new Error(data.error || "Failed to save service");
      }

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
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
            placeholder="e.g., Web Development"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Slug (URL path) *
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">/services/</span>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
              placeholder="web-development"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Auto-generated from title, but you can edit it
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="shortDesc"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Short Description *
          </label>
          <textarea
            id="shortDesc"
            required
            value={formData.shortDesc}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, shortDesc: e.target.value }))
            }
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="One-line summary for cards"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Full description shown on cards"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="outcome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Outcome
          </label>
          <input
            type="text"
            id="outcome"
            value={formData.outcome}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, outcome: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="One-line outcome/benefit (optional)"
          />
        </div>

        <div>
          <label
            htmlFor="priceLabel"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price Label *
          </label>
          <input
            type="text"
            id="priceLabel"
            required
            value={formData.priceLabel}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, priceLabel: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., Starting at $5,000"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price (numeric)
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., 5000"
          />
          <p className="mt-1 text-xs text-gray-500">Base price in dollars (for sorting/filtering)</p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="priceNote"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price Note
          </label>
          <input
            type="text"
            id="priceNote"
            value={formData.priceNote}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, priceNote: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., First 5 clients only"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="badgeText"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Badge Text
          </label>
          <input
            type="text"
            id="badgeText"
            value={formData.badgeText}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, badgeText: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., First 5 clients · Founding rate"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">Show in featured section</p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">Show on public site</p>
        </div>

        <div>
          <label
            htmlFor="ctaLabel"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CTA Label *
          </label>
          <input
            type="text"
            id="ctaLabel"
            required
            value={formData.ctaLabel}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ctaLabel: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., Get a Quote"
          />
        </div>

        <div>
          <label
            htmlFor="ctaUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CTA URL *
          </label>
          <input
            type="text"
            id="ctaUrl"
            required
            value={formData.ctaUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ctaUrl: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="/contact"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sort Order *
          </label>
          <input
            type="number"
            id="sortOrder"
            required
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="seoTitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SEO Title
          </label>
          <input
            type="text"
            id="seoTitle"
            value={formData.seoTitle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., Web Development Services - CerpaMedia"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="seoDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SEO Description
          </label>
          <textarea
            id="seoDescription"
            value={formData.seoDescription}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))
            }
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Meta description for search engines"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link
          href="/admin/services"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Service" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
