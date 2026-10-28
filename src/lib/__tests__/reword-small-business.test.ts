import { describe, expect, it } from "vitest";
import {
  HERO_SUBHEADLINE,
  INSIGHT_PLANS,
  SEO_DESCRIPTION,
  SEO_TITLE,
  applySwaps,
  findFraming,
  presentHeroSubheadline,
  presentInsight,
  presentSeoText,
  retag,
  unhandledFraming,
} from "../reword-small-business";

describe("reword small-business copy", () => {
  it("replaces a sentence once and is a no-op the second time", () => {
    const source = "For SMBs, that means one shared coworker.";
    const swap = {
      from: "For SMBs, that means one shared coworker.",
      to: "For owner-led teams, that means one shared coworker.",
    };

    const first = applySwaps(source, [swap]);
    expect(first.text).toBe(swap.to);
    expect(first.changes).toHaveLength(1);
    expect(first.missing).toEqual([]);

    const second = applySwaps(first.text, [swap]);
    expect(second.text).toBe(swap.to);
    expect(second.changes).toEqual([]);
    expect(second.missing).toEqual([]);
  });

  it("matches a curly apostrophe against a straight one", () => {
    const result = applySwaps("Meta\u2019s Muse agent for small businesses.", [
      {
        from: "Meta's Muse agent for small businesses.",
        to: "Meta's Muse agent for owners.",
      },
    ]);
    expect(result.text).toBe("Meta's Muse agent for owners.");
    expect(result.missing).toEqual([]);
  });

  it("leaves an existing URL in place and classifies it", () => {
    const url = "https://example.com/guide/small-business-tips";
    const hits = findFraming(`Read ${url} today.`);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((hit) => hit.reason?.includes("URL"))).toBe(true);
    expect(unhandledFraming(`Read ${url} today.`)).toEqual([]);
  });

  it("leaves a cited report title and flags positioning", () => {
    const cited = "OpenAI published Small Businesses, Bigger Capabilities.";
    expect(unhandledFraming(cited)).toEqual([]);

    const positioning = "This offer is for small businesses.";
    expect(unhandledFraming(positioning)).toHaveLength(1);
  });

  it("keeps the hero promise and does not size the reader", () => {
    expect(HERO_SUBHEADLINE.to).toContain("you own the accounts and code.");
    expect(unhandledFraming(HERO_SUBHEADLINE.to)).toEqual([]);
    expect(unhandledFraming(SEO_TITLE.to)).toEqual([]);
    expect(unhandledFraming(SEO_DESCRIPTION.to)).toEqual([]);
  });

  it("rewrites tags without duplicating the replacement", () => {
    const first = retag(["AI", "SMB", "operations"], { SMB: "operations" });
    expect(first.tags).toEqual(["AI", "operations"]);
    const second = retag(first.tags, { SMB: "operations" });
    expect(second.tags).toEqual(["AI", "operations"]);
    expect(second.changes).toEqual([]);
  });

  it("ships replacement sentences that no longer size the reader", () => {
    const replacements = [
      HERO_SUBHEADLINE.to,
      SEO_TITLE.to,
      SEO_DESCRIPTION.to,
      ...INSIGHT_PLANS.flatMap((plan) => [
        ...plan.title.map((swap) => swap.to),
        ...plan.summary.map((swap) => swap.to),
        ...plan.body.map((swap) => swap.to),
        ...Object.values(plan.tags),
      ]),
    ];

    for (const text of replacements) {
      expect(unhandledFraming(text), text).toEqual([]);
    }
  });

  it("presents stored copy without changing the slug", () => {
    const presented = presentInsight({
      slug: "meta-muse-business-tools",
      title: "Meta's Muse agent now plugs into the tools small businesses already run",
      summary: "Meta expanded Muse for U.S. and Canada SMBs on Sep 29, 2026 — connectors to Shopify, QuickBooks, Slack, Stripe, and more, with owner approval before publish, send, or spend. Free tier plus $20/$100 plans.",
      body: "On September 29, 2026, Meta expanded its Muse AI agent for small businesses in the U.S. and Canada.",
      tags: ["ai", "small-business"],
    });

    expect(presented.slug).toBe("meta-muse-business-tools");
    expect(presented.title).toBe("Meta's Muse agent now plugs into the tools owners already run");
    expect(presented.tags).toEqual(["ai", "owner-led"]);
    expect(unhandledFraming(`${presented.title}\n${presented.summary}\n${presented.body}`)).toEqual([]);
    expect(presentInsight(presented)).toEqual(presented);
    expect(presentHeroSubheadline(HERO_SUBHEADLINE.from)).toBe(HERO_SUBHEADLINE.to);
    expect(presentSeoText(SEO_TITLE.from, SEO_TITLE)).toBe(SEO_TITLE.to);
  });

  it("presents stored copy with OLD slug (transition state fallback)", () => {
    // During transition: DB still has old slug, but plan is keyed by new slug
    const presented = presentInsight({
      slug: "meta-muse-small-business-tools", // old slug still in DB
      title: "Meta's Muse agent now plugs into the tools small businesses already run",
      summary: "Meta expanded Muse for U.S. and Canada SMBs on Sep 29, 2026 — connectors to Shopify, QuickBooks, Slack, Stripe, and more, with owner approval before publish, send, or spend. Free tier plus $20/$100 plans.",
      body: "On September 29, 2026, Meta expanded its Muse AI agent for small businesses in the U.S. and Canada.",
      tags: ["ai", "small-business"],
    });

    // Should still find the plan and apply rewrites
    expect(presented.slug).toBe("meta-muse-small-business-tools"); // slug unchanged
    expect(presented.title).toBe("Meta's Muse agent now plugs into the tools owners already run");
    expect(presented.tags).toEqual(["ai", "owner-led"]);
    expect(unhandledFraming(`${presented.title}\n${presented.summary}\n${presented.body}`)).toEqual([]);
  });

  it("does not include slug fields in the text swaps", () => {
    for (const plan of INSIGHT_PLANS) {
      const blob = JSON.stringify({
        title: plan.title,
        summary: plan.summary,
        body: plan.body,
        tags: plan.tags,
      });
      expect(blob).not.toContain(`"slug"`);
      expect(plan.slug.length).toBeGreaterThan(0);
    }
  });
});