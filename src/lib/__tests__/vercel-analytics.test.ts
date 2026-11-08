import { describe, expect, it } from "vitest";
import { shouldSendVercelPageview, vercelAnalyticsBeforeSend } from "../vercel-analytics";

describe("Vercel pageview filter", () => {
  it("keeps ordinary public pages", () => {
    expect(shouldSendVercelPageview("https://cerpamedia.com/")).toBe(true);
    expect(shouldSendVercelPageview("https://cerpamedia.com/consult")).toBe(true);
    expect(shouldSendVercelPageview("https://cerpamedia.com/insights/meta-muse-business-tools")).toBe(
      true
    );
  });

  it("drops admin screens and token-gated launch setup URLs", () => {
    expect(shouldSendVercelPageview("https://cerpamedia.com/admin")).toBe(false);
    expect(shouldSendVercelPageview("https://cerpamedia.com/admin/seo")).toBe(false);
    expect(shouldSendVercelPageview("https://cerpamedia.com/launch/setup/secret-token")).toBe(false);
    expect(
      vercelAnalyticsBeforeSend({
        type: "pageview" as const,
        url: "https://preview.cerpamedia.com/launch/setup/secret-token",
      })
    ).toBeNull();
    expect(
      vercelAnalyticsBeforeSend({
        type: "pageview" as const,
        url: "https://cerpamedia.com/services",
      })
    ).toEqual({
      type: "pageview",
      url: "https://cerpamedia.com/services",
    });
  });
});
