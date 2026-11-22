"use client";

import { useState } from "react";
import {
  hasSavedHeroPairs,
  previousSingleHeadline,
  resolveHeroContent,
  type HeroContent,
  type HeroPair,
} from "@/lib/hero-content";

interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksContent {
  steps: HowItWorksStep[];
}

interface Props {
  hero?: unknown;
  howItWorks?: HowItWorksContent;
}

const defaultHowItWorks: HowItWorksContent = {
  steps: [
    {
      title: "Clarity before code",
      description: "Paid discovery maps what to build (and what not to). Then a fixed statement of work with milestones — so you're not buying an open-ended project.",
    },
    {
      title: "You own the system",
      description: "GitHub, hosting, domain, database, and third-party accounts stay in <em>your</em> name. We're a collaborator, not a landlord.",
    },
    {
      title: "Practical over trendy",
      description: "We recommend what your business will actually use next quarter — not a slide deck of buzzwords.",
    },
  ],
};

export default function HomeContentEditor({ hero, howItWorks }: Props) {
  const [heroData, setHeroData] = useState<HeroContent>(() => resolveHeroContent(hero));
  const [usesBuiltInPairs, setUsesBuiltInPairs] = useState(() => !hasSavedHeroPairs(hero));
  const [replacedHeadline] = useState(() => previousSingleHeadline(hero));
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksContent>(
    howItWorks || defaultHowItWorks
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updatePair = (index: number, patch: Partial<HeroPair>) => {
    setHeroData((current) => ({
      ...current,
      pairs: current.pairs.map((pair, pairIndex) =>
        pairIndex === index ? { ...pair, ...patch } : pair
      ),
    }));
  };

  const movePair = (index: number, direction: -1 | 1) => {
    setHeroData((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.pairs.length) return current;
      const pairs = current.pairs.slice();
      const [moved] = pairs.splice(index, 1);
      pairs.splice(nextIndex, 0, moved);
      return { ...current, pairs };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const incomplete = heroData.pairs.some(
      (pair) => !pair.headline.trim() || !pair.subheadline.trim()
    );
    if (incomplete || heroData.pairs.length === 0) {
      setMessage({
        type: "error",
        text: "Each rotating line needs a headline and a supporting line.",
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: heroData,
          howItWorks: howItWorksData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setUsesBuiltInPairs(false);
      setMessage({ type: "success", text: "Saved successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Hero Section</h2>
        <p className="text-sm text-gray-600 mb-6">
          When more than one line is saved, the home page fades through them
          about every 6 seconds. The first line is the page heading.
          Hovering or focusing the hero pauses the rotation. Visitors who
          prefer reduced motion only see the first line.
        </p>
        {usesBuiltInPairs ? (
          <p className="text-sm text-gray-600 mb-6">
            This saved hero has no rotating list, so the live site uses the
            lines below. Saving stores this list.
          </p>
        ) : null}
        {replacedHeadline ? (
          <p className="text-sm text-gray-600 mb-6">
            A previous headline is still stored and is not on the live site:{" "}
            <span className="text-gray-900">{replacedHeadline}</span>. Add it
            as a line below if you still want it, then save.
          </p>
        ) : null}
        <div className="space-y-4">
          {heroData.pairs.map((pair, index) => (
            <div key={index} className="border border-gray-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Line {index + 1}
                  {index === 0 ? " — shown first" : ""}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => movePair(index, -1)}
                    disabled={index === 0}
                    className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => movePair(index, 1)}
                    disabled={index === heroData.pairs.length - 1}
                    className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (heroData.pairs.length <= 1) return;
                      setHeroData({
                        ...heroData,
                        pairs: heroData.pairs.filter((_, pairIndex) => pairIndex !== index),
                      });
                    }}
                    disabled={heroData.pairs.length <= 1}
                    className="text-sm text-red-600 border border-red-300 rounded px-3 py-1 hover:bg-red-50 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1" htmlFor={`hero-headline-${index}`}>
                  Headline
                </label>
                <input
                  id={`hero-headline-${index}`}
                  type="text"
                  value={pair.headline}
                  onChange={(e) => updatePair(index, { headline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1" htmlFor={`hero-subheadline-${index}`}>
                  Supporting line
                </label>
                <textarea
                  id={`hero-subheadline-${index}`}
                  value={pair.subheadline}
                  onChange={(e) => updatePair(index, { subheadline: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setHeroData({
                ...heroData,
                pairs: [...heroData.pairs, { headline: "", subheadline: "" }],
              })
            }
            className="text-sm border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
          >
            Add a line
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary CTA Label
              </label>
              <input
                type="text"
                value={heroData.primaryCtaLabel}
                onChange={(e) =>
                  setHeroData({ ...heroData, primaryCtaLabel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary CTA URL
              </label>
              <input
                type="text"
                value={heroData.primaryCtaUrl}
                onChange={(e) =>
                  setHeroData({ ...heroData, primaryCtaUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="md:col-span-2 text-xs text-gray-500">
              Leave a CTA label or URL blank to hide that link on the public home page.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary CTA Label
              </label>
              <input
                type="text"
                value={heroData.secondaryCtaLabel}
                onChange={(e) =>
                  setHeroData({ ...heroData, secondaryCtaLabel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary CTA URL
              </label>
              <input
                type="text"
                value={heroData.secondaryCtaUrl}
                onChange={(e) =>
                  setHeroData({ ...heroData, secondaryCtaUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          How We Work Section
        </h2>
        <div className="space-y-6">
          {howItWorksData.steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Step {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newSteps = howItWorksData.steps.filter((_, i) => i !== index);
                    setHowItWorksData({ ...howItWorksData, steps: newSteps });
                  }}
                  className="text-sm text-red-600 border border-red-300 rounded px-3 py-1 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...howItWorksData.steps];
                      newSteps[index].title = e.target.value;
                      setHowItWorksData({ ...howItWorksData, steps: newSteps });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Description (use &lt;em&gt; for italics)
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...howItWorksData.steps];
                      newSteps[index].description = e.target.value;
                      setHowItWorksData({ ...howItWorksData, steps: newSteps });
                    }}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setHowItWorksData({
                ...howItWorksData,
                steps: [...howItWorksData.steps, { title: "", description: "" }],
              });
            }}
            className="text-sm border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
          >
            Add step
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
        <div>
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
