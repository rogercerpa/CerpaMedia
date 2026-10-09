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
  features: string[];
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
      features: [],
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
        features: formData.features,
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

        {/* Features Editor */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features (What we offer bullets)
          </label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData((prev) => ({ ...prev, features: newFeatures }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Custom website design and development"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (index > 0) {
                      const newFeatures = [...formData.features];
                      [newFeatures[index - 1], newFeatures[index]] = [newFeatures[index], newFeatures[index - 1]];
                      setFormData((prev) => ({ ...prev, features: newFeatures }));
                    }
                  }}
                  disabled={index === 0}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (index < formData.features.length - 1) {
                      const newFeatures = [...formData.features];
                      [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
                      setFormData((prev) => ({ ...prev, features: newFeatures }));
                    }
                  }}
                  disabled={index === formData.features.length - 1}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = formData.features.filter((_, i) => i !== index);
                    setFormData((prev) => ({ ...prev, features: newFeatures }));
                  }}
                  className="px-3 py-2 bg-red-100 text-red-700 text-sm hover:bg-red-200"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 border border-gray-300"
            >
              + Add Feature
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Shown as bullets in the "What we offer" section on public cards</p>
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
          <p className="mt-1 text-xs text-gray-500">Not shown on public service cards yet.</p>
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
          <p className="mt-1 text-xs text-gray-500">Not shown on public service cards yet.</p>
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

      {/* Preview Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          {formData.featured ? (
            // Featured service preview (matches AI Teammate Launch block)
            <div className="border-2 border-gray-900 p-8 md:p-10 bg-white max-w-3xl">
              {formData.badgeText && (
                <div className="inline-block border border-gray-300 px-3 py-1 mb-4">
                  <span className="text-[11px] font-medium text-gray-900 uppercase tracking-wider">{formData.badgeText}</span>
                </div>
              )}
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                {formData.title || "Service Title"}
              </h2>
              <p className="text-xl font-medium text-gray-900 mb-3">
                {formData.priceLabel || "Price"}
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                {formData.description || "Description will appear here"}
              </p>
              <button
                type="button"
                className="inline-block bg-gray-900 text-white px-8 py-3.5 text-[15px] font-medium"
              >
                {formData.ctaLabel || "Get a Quote"}
              </button>
            </div>
          ) : (
            // Regular service card preview (matches public /services cards)
            <div className="border border-gray-300 p-8 max-w-3xl bg-white">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
                {formData.title || "Service Title"}
              </h2>
              <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                {formData.description || "Description will appear here"}
              </p>
              {formData.features.length > 0 && (
                <div className="border-t border-gray-300 pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wider">What we offer</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-gray-600 text-[15px]">•</span>
                        <span className="text-gray-600 text-[15px] leading-relaxed">{feature || "(empty)"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {formData.published && formData.slug && (
            <div className="mt-4">
              <a
                href={`/services/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                → View on site (in new tab)
              </a>
            </div>
          )}
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
