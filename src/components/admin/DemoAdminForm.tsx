"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReplayScript } from "@/lib/demo-safety";
import type { AdminRole } from "@/lib/roles";
import type { PublishStatus } from "@/lib/publishing";
import WorkflowStatusSelect from "@/components/admin/WorkflowStatusSelect";

type Sample = {
  id?: string;
  label: string;
  inputText: string;
  cachedOutput: string;
};

export default function DemoAdminForm({
  isOwner,
  role,
  flags,
  initialData,
}: {
  isOwner: boolean;
  role: AdminRole;
  flags: {
    foundationsUiEnabled: boolean;
    analyticsEnabled: boolean;
    demosPublicEnabled: boolean;
    demoKillSwitch: boolean;
  };
  initialData: {
    id: string;
    slug: string;
    title: string;
    description: string;
    enabled: boolean;
    status: PublishStatus;
    restingMessage: string;
    replayScript: ReplayScript;
    samples: Sample[];
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [killSwitch, setKillSwitch] = useState(flags.demoKillSwitch);
  const [foundationsUiEnabled, setFoundationsUiEnabled] = useState(
    flags.foundationsUiEnabled
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState(flags.analyticsEnabled);
  const [demosPublicEnabled, setDemosPublicEnabled] = useState(
    flags.demosPublicEnabled
  );
  const [demo, setDemo] = useState(initialData);

  const saveSettings = async () => {
    if (!isOwner) {
      setError("Only the owner can change demo safety settings.");
      return;
    }
    const response = await fetch("/api/admin/demos/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foundationsUiEnabled,
        analyticsEnabled,
        demosPublicEnabled,
        demoKillSwitch: killSwitch,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to save settings");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await saveSettings();
      const response = await fetch(`/api/admin/demos/${demo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: demo.slug,
          title: demo.title,
          description: demo.description,
          enabled: demo.enabled,
          status: demo.status,
          restingMessage: demo.restingMessage,
          replayScript: demo.replayScript,
          samples: demo.samples,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save demo");
      setMessage("Saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save demo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {message}
        </div>
      ) : null}

      <section className="border border-gray-200 p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Safety controls</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={killSwitch}
            onChange={(e) => setKillSwitch(e.target.checked)}
            disabled={!isOwner}
          />
          Kill switch (public UI shows the recorded replay only)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={foundationsUiEnabled}
            onChange={(e) => setFoundationsUiEnabled(e.target.checked)}
            disabled={!isOwner}
          />
          Show signed note, review stamp, footer badge, and privacy draft on live pages (OFF by default)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={analyticsEnabled}
            onChange={(e) => setAnalyticsEnabled(e.target.checked)}
            disabled={!isOwner}
          />
          Enable Vercel Web Analytics script (OFF by default so live head tags stay unchanged)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={demosPublicEnabled}
            onChange={(e) => setDemosPublicEnabled(e.target.checked)}
            disabled={!isOwner}
          />
          Make published demos public on /try (OFF by default — visitors get 404 until this is on)
        </label>
      </section>

      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={demo.title}
            onChange={(e) => setDemo((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            value={demo.slug}
            onChange={(e) => setDemo((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={demo.description}
            onChange={(e) =>
              setDemo((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={demo.enabled}
            onChange={(e) =>
              setDemo((prev) => ({ ...prev, enabled: e.target.checked }))
            }
          />
          Demo enabled (admin can still preview while Draft)
        </label>
        <WorkflowStatusSelect
          value={demo.status}
          onChange={(status) => setDemo((prev) => ({ ...prev, status }))}
          role={role}
        />
        <p className="text-sm text-gray-600">
          <Link
            href={`/admin/preview/demo/${demo.slug}`}
            className="text-gray-900 underline"
          >
            Open admin preview
          </Link>
          {" · "}
          <Link
            href="/admin/preview/demo-fallback"
            className="text-gray-900 underline"
          >
            Kill-switch fallback preview
          </Link>
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kill-switch message
          </label>
          <input
            value={demo.restingMessage}
            onChange={(e) =>
              setDemo((prev) => ({ ...prev, restingMessage: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Recorded replay</h3>
        {(["inputLabel", "outputLabel", "before", "after"] as const).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
            <textarea
              rows={key === "before" || key === "after" ? 4 : 1}
              value={demo.replayScript[key]}
              onChange={(e) =>
                setDemo((prev) => ({
                  ...prev,
                  replayScript: { ...prev.replayScript, [key]: e.target.value },
                }))
              }
              className="w-full px-4 py-2 border border-gray-300"
            />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Curated samples</h3>
        <p className="text-sm text-gray-600">
          Outputs are pre-written text Roger edits here. Nothing on this site calls a model.
        </p>
        {demo.samples.map((sample, index) => (
          <div key={sample.id || index} className="border border-gray-200 p-4 space-y-3">
            <input
              value={sample.label}
              onChange={(e) =>
                setDemo((prev) => ({
                  ...prev,
                  samples: prev.samples.map((item, i) =>
                    i === index ? { ...item, label: e.target.value } : item
                  ),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300"
              placeholder="Sample label"
            />
            <textarea
              rows={3}
              value={sample.inputText}
              onChange={(e) =>
                setDemo((prev) => ({
                  ...prev,
                  samples: prev.samples.map((item, i) =>
                    i === index ? { ...item, inputText: e.target.value } : item
                  ),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300"
              placeholder="Sample input"
            />
            <textarea
              rows={5}
              value={sample.cachedOutput}
              onChange={(e) =>
                setDemo((prev) => ({
                  ...prev,
                  samples: prev.samples.map((item, i) =>
                    i === index ? { ...item, cachedOutput: e.target.value } : item
                  ),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300"
              placeholder="Pre-written output"
            />
          </div>
        ))}
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link href="/admin/demos" className="text-sm text-gray-600 hover:text-gray-900">
          Back to demos
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save demo and settings"}
        </button>
      </div>
    </form>
  );
}
