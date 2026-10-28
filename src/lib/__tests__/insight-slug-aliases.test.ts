import { describe, expect, it } from "vitest";
import {
  INSIGHT_SLUG_ALIASES,
  getCanonicalSlug,
  getOldSlug,
} from "../insight-slug-aliases";

describe("insight slug aliases", () => {
  it("maps all old slugs to new slugs", () => {
    expect(INSIGHT_SLUG_ALIASES).toEqual({
      "openai-gpt-4o-gpt-4-1-api-shutdown-small-business": "openai-gpt-4o-gpt-4-1-api-shutdown",
      "small-business-ai-adoption-october-2026": "business-ai-adoption-october-2026",
      "dots-vs-grok-bot-vs-muse-smb-ai-teammate": "dots-vs-grok-bot-vs-muse-ai-teammate",
      "openai-smb-agentic-shift-sbdc-report": "openai-agentic-shift-sbdc-report",
      "openai-dots-always-on-agents-smb": "openai-dots-always-on-agents",
      "meta-muse-small-business-tools": "meta-muse-business-tools",
      "grok-team-bots-shared-ai-coworkers-smb": "grok-team-bots-shared-ai-coworkers",
    });
  });

  it("gets canonical slug from old slug", () => {
    expect(getCanonicalSlug("meta-muse-small-business-tools")).toBe("meta-muse-business-tools");
    expect(getCanonicalSlug("openai-smb-agentic-shift-sbdc-report")).toBe("openai-agentic-shift-sbdc-report");
  });

  it("returns slug unchanged if no alias exists", () => {
    expect(getCanonicalSlug("some-other-article")).toBe("some-other-article");
    expect(getCanonicalSlug("meta-muse-business-tools")).toBe("meta-muse-business-tools");
  });

  it("gets old slug from new slug", () => {
    expect(getOldSlug("meta-muse-business-tools")).toBe("meta-muse-small-business-tools");
    expect(getOldSlug("openai-agentic-shift-sbdc-report")).toBe("openai-smb-agentic-shift-sbdc-report");
  });

  it("returns undefined if no old slug exists", () => {
    expect(getOldSlug("some-other-article")).toBeUndefined();
    expect(getOldSlug("meta-muse-small-business-tools")).toBeUndefined();
  });
});
