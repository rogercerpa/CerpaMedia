import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomeContentEditor from "@/app/admin/home-content/HomeContentEditor";
import { DEFAULT_HERO_PAIRS, LEGACY_HERO_HEADLINE } from "@/lib/hero-content";

describe("HomeContentEditor hero list", () => {
  it("shows the built-in lines when the saved hero is the old single headline", () => {
    const html = renderToStaticMarkup(
      <HomeContentEditor
        hero={{
          headline: LEGACY_HERO_HEADLINE,
          subheadline: "CerpaMedia helps business owners get practical web apps, AI, and automation.",
          primaryCtaLabel: "",
          primaryCtaUrl: "",
          secondaryCtaLabel: "",
          secondaryCtaUrl: "",
        }}
      />,
    );

    for (const pair of DEFAULT_HERO_PAIRS) {
      expect(html).toContain(pair.headline);
    }
    expect(html).toContain("no rotating list");
    expect(html).not.toContain(LEGACY_HERO_HEADLINE);
    expect(html).toContain('value=""');
  });

  it("quotes a custom single headline that the live site will not show", () => {
    const html = renderToStaticMarkup(
      <HomeContentEditor
        hero={{
          headline: "A custom headline from the old editor",
          subheadline: "Old supporting line",
        }}
      />,
    );

    expect(html).toContain("A custom headline from the old editor");
    expect(html).toContain("not on the live site");
    expect(html).toContain(DEFAULT_HERO_PAIRS[0].headline);
  });
});
