"use client";

import { useState } from "react";

interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
}

interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksContent {
  steps: HowItWorksStep[];
}

interface Props {
  hero?: HeroContent;
  howItWorks?: HowItWorksContent;
}

const defaultHero: HeroContent = {
  headline: "Stop losing hours to tools that don't talk to each other.",
  subheadline: "CerpaMedia helps small businesses get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
  primaryCtaLabel: "Book the $99 Strategy Call",
  primaryCtaUrl: "/consult",
  secondaryCtaLabel: "Or email Roger",
  secondaryCtaUrl: "mailto:cerpamedia@gmail.com",
};

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
  const [heroData, setHeroData] = useState<HeroContent>(hero || defaultHero);
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksContent>(
    howItWorks || defaultHowItWorks
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Hero Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline
            </label>
            <input
              type="text"
              value={heroData.headline}
              onChange={(e) =>
                setHeroData({ ...heroData, headline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subheadline
            </label>
            <textarea
              value={heroData.subheadline}
              onChange={(e) =>
                setHeroData({ ...heroData, subheadline: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

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
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Step {index + 1}
              </h3>
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
