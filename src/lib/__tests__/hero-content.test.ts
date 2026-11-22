import { describe, expect, it } from "vitest";
import { HERO_SUBHEADLINE } from "@/lib/reword-small-business";
import {
  DEFAULT_HERO_PAIRS,
  LEGACY_HERO_HEADLINE,
  hasSavedHeroPairs,
  previousSingleHeadline,
  resolveHeroContent,
} from "@/lib/hero-content";

const productionRow = {
  headline: LEGACY_HERO_HEADLINE,
  subheadline:
    "CerpaMedia helps business owners get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
  primaryCtaLabel: "",
  primaryCtaUrl: "",
  secondaryCtaLabel: "",
  secondaryCtaUrl: "",
};

describe("resolveHeroContent", () => {
  it("uses the five built-in lines when nothing is stored", () => {
    const result = resolveHeroContent(null);

    expect(result.pairs).toEqual(DEFAULT_HERO_PAIRS.map((pair) => ({ ...pair })));
    expect(result.headline).toBe(DEFAULT_HERO_PAIRS[0].headline);
    expect(result.subheadline).toBe(DEFAULT_HERO_PAIRS[0].subheadline);
    expect(result.primaryCtaLabel).toBe("");
    expect(result.primaryCtaUrl).toBe("");
    expect(result.secondaryCtaLabel).toBe("");
    expect(result.secondaryCtaUrl).toBe("");
  });

  it("uses the built-in lines for production's old headline row and keeps its links", () => {
    const result = resolveHeroContent({
      ...productionRow,
      primaryCtaLabel: "Book a call",
      primaryCtaUrl: "/consult",
    });

    expect(result.headline).toBe("From idea to working system in days, not months.");
    expect(result.headline).not.toBe(LEGACY_HERO_HEADLINE);
    expect(result.pairs.map((pair) => pair.headline)).toEqual([
      "From idea to working system in days, not months.",
      "Build more. Build better. In a fraction of the time.",
      "The AI era is here. Put it to work for you.",
      "Prototype Monday. Production by Friday.",
      "Reach further, faster.",
    ]);
    expect(result.pairs[2].subheadline).toContain("you own the accounts and code.");
    expect(result.primaryCtaLabel).toBe("Book a call");
    expect(result.primaryCtaUrl).toBe("/consult");
    expect(hasSavedHeroPairs(productionRow)).toBe(false);
    expect(previousSingleHeadline(productionRow)).toBeNull();
  });

  it("still uses the built-in lines when the old headline has a curly apostrophe", () => {
    const headline = "Stop losing hours to tools that don’t talk to each other.";
    const result = resolveHeroContent({
      headline,
      subheadline: "CerpaMedia helps small businesses get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
    });

    expect(result.pairs).toHaveLength(5);
    expect(result.headline).toBe(DEFAULT_HERO_PAIRS[0].headline);
    expect(previousSingleHeadline({ headline })).toBeNull();
  });

  it("uses the built-in lines when a custom single headline has no rotating list", () => {
    const stored = {
      headline: "A custom headline from the old editor",
      subheadline: "A custom supporting line.",
      secondaryCtaLabel: "Email",
      secondaryCtaUrl: "mailto:hello@example.com",
    };

    const result = resolveHeroContent(stored);

    expect(result.headline).toBe(DEFAULT_HERO_PAIRS[0].headline);
    expect(result.subheadline).not.toBe(stored.subheadline);
    expect(result.secondaryCtaLabel).toBe("Email");
    expect(result.secondaryCtaUrl).toBe("mailto:hello@example.com");
    expect(previousSingleHeadline(stored)).toBe(stored.headline);
  });

  it("uses a saved rotating list and rewrites a stored small-business line", () => {
    const result = resolveHeroContent({
      headline: "This old field is ignored",
      subheadline: "This one is ignored too",
      pairs: [
        { headline: "  First custom  ", subheadline: "  First support  " },
        { headline: "", subheadline: "dropped" },
        { headline: "Second custom", subheadline: HERO_SUBHEADLINE.from },
        null,
      ],
      primaryCtaLabel: "Read",
      primaryCtaUrl: "/insights",
    });

    expect(result.pairs).toEqual([
      { headline: "First custom", subheadline: "First support" },
      { headline: "Second custom", subheadline: HERO_SUBHEADLINE.to },
    ]);
    expect(result.headline).toBe("First custom");
    expect(result.subheadline).toBe("First support");
    expect(result.primaryCtaLabel).toBe("Read");
    expect(hasSavedHeroPairs(result)).toBe(true);
    expect(previousSingleHeadline(result)).toBeNull();
  });

  it("falls back to the built-in lines when the saved list is empty or invalid", () => {
    expect(resolveHeroContent({ pairs: [] }).headline).toBe(DEFAULT_HERO_PAIRS[0].headline);
    expect(resolveHeroContent({ pairs: [{ headline: " ", subheadline: "x" }] }).pairs).toHaveLength(5);
    expect(resolveHeroContent({ pairs: "nope" }).pairs).toHaveLength(5);
    expect(resolveHeroContent("nope").pairs).toHaveLength(5);
  });

  it("keeps prices and size framing out of the built-in lines", () => {
    const text = DEFAULT_HERO_PAIRS.map((pair) => `${pair.headline}\n${pair.subheadline}`).join("\n");

    expect(DEFAULT_HERO_PAIRS).toHaveLength(5);
    expect(text).not.toMatch(/small[\s-]business|\bsmbs?\b/i);
    expect(text).not.toMatch(/\$\s*\d|\b\d+\s*dollars?\b/i);
  });
});
