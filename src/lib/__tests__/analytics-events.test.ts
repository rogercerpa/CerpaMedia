import { describe, expect, it } from "vitest";
import {
  insightReadEventName,
  isLikelyBot,
  isStoredAnalyticsEvent,
  resolveClientAnalyticsEvent,
  shouldSkipAnalytics,
} from "../analytics-events";

const BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

describe("analytics event names", () => {
  it("stores an insight read under the canonical slug", () => {
    expect(insightReadEventName("meta-muse-small-business-tools")).toBe(
      "insight_read:meta-muse-business-tools"
    );
    expect(insightReadEventName("meta-muse-business-tools")).toBe(
      "insight_read:meta-muse-business-tools"
    );
    expect(isStoredAnalyticsEvent("insight_read:meta-muse-business-tools")).toBe(true);
    expect(isStoredAnalyticsEvent("insight_read:meta-muse-small-business-tools")).toBe(false);
  });

  it("rejects client attempts to record a contact submission", () => {
    expect(resolveClientAnalyticsEvent({ event: "contact_submit" })).toBeNull();
    expect(resolveClientAnalyticsEvent({ event: "cta_99_click" })).toBe("cta_99_click");
    expect(
      resolveClientAnalyticsEvent({
        event: "insight_read",
        slug: "openai-smb-agentic-shift-sbdc-report",
      })
    ).toBe("insight_read:openai-agentic-shift-sbdc-report");
  });

  it("skips bots, admin traffic, and prefetch", () => {
    expect(isLikelyBot(BROWSER)).toBe(false);
    expect(isLikelyBot("curl/8.0.0")).toBe(true);
    expect(isLikelyBot("")).toBe(true);
    expect(
      shouldSkipAnalytics({
        userAgent: BROWSER,
        path: "/insights/meta-muse-business-tools",
      })
    ).toBe(false);
    expect(
      shouldSkipAnalytics({
        userAgent: BROWSER,
        path: "/insights/meta-muse-business-tools",
        referer: "https://cerpamedia.com/admin/insights",
      })
    ).toBe(true);
    expect(
      shouldSkipAnalytics({
        userAgent: BROWSER,
        path: "/admin/insights",
      })
    ).toBe(true);
    expect(
      shouldSkipAnalytics({
        userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        path: "/insights/example",
      })
    ).toBe(true);
    expect(shouldSkipAnalytics({ userAgent: BROWSER, prefetch: true })).toBe(true);
  });
});
