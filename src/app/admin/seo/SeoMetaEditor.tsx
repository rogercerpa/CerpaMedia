"use client";

import { useState } from "react";

interface PageMeta {
  path: string;
  label: string;
}

interface SeoMeta {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
}

interface Props {
  pages: PageMeta[];
  seoMetaMap: Record<string, SeoMeta>;
}

export default function SeoMetaEditor({ pages, seoMetaMap }: Props) {
  const [data, setData] = useState<Record<string, { title: string; description: string; ogImageUrl: string }>>(
    Object.fromEntries(
      pages.map((page) => [
        page.path,
        {
          title: seoMetaMap[page.path]?.title || "",
          description: seoMetaMap[page.path]?.description || "",
          ogImageUrl: seoMetaMap[page.path]?.ogImageUrl || "",
        },
      ])
    )
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSave = async (path: string) => {
    setSaving(path);

    try {
      const response = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          ...data[path],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }
    } catch (error) {
      alert("Failed to save SEO metadata");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {pages.map((page) => {
        const meta = data[page.path];
        const titleLen = meta.title.length;
        const descLen = meta.description.length;
        const isExpanded = expanded === page.path;

        return (
          <div key={page.path} className="border-b border-gray-200 last:border-b-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{page.label}</h3>
                  <p className="text-sm text-gray-500">{page.path}</p>
                </div>
                <button
                  onClick={() => setExpanded(isExpanded ? null : page.path)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {isExpanded ? "Collapse" : "Edit"}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title ({titleLen} / ~60)
                    </label>
                    <input
                      type="text"
                      value={meta.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          [page.path]: { ...data[page.path], title: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {titleLen > 60 && (
                      <p className="text-xs text-amber-600 mt-1">Title is long (may be truncated)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description ({descLen} / ~155)
                    </label>
                    <textarea
                      value={meta.description}
                      onChange={(e) =>
                        setData({
                          ...data,
                          [page.path]: {
                            ...data[page.path],
                            description: e.target.value,
                          },
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {descLen > 155 && (
                      <p className="text-xs text-amber-600 mt-1">Description is long (may be truncated)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OG Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={meta.ogImageUrl}
                      onChange={(e) =>
                        setData({
                          ...data,
                          [page.path]: {
                            ...data[page.path],
                            ogImageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Google Preview:</p>
                    <div className="space-y-1">
                      <p className="text-lg text-blue-700 hover:underline">
                        {meta.title || "No title set"}
                      </p>
                      <p className="text-xs text-green-700">cerpamedia.com{page.path}</p>
                      <p className="text-sm text-gray-600">
                        {meta.description || "No description set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave(page.path)}
                      disabled={saving === page.path}
                      className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
                    >
                      {saving === page.path ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {!isExpanded && meta.title && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{meta.title}</p>
                  {meta.description && (
                    <p className="text-xs mt-1 line-clamp-1">{meta.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
