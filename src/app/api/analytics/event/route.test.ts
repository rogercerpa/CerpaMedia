import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { isAnalyticsEnabled } from "@/lib/flags";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    analyticsDailyCount: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/flags", () => ({
  isAnalyticsEnabled: vi.fn(),
}));

const BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let ip = 1;

function post(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/analytics/event", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": BROWSER,
      "x-forwarded-for": `198.51.100.${ip++}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics/event", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAnalyticsEnabled).mockResolvedValue(true);
    vi.mocked(prisma.analyticsDailyCount.upsert).mockResolvedValue({} as never);
  });

  it("records a $99 click when analytics is enabled", async () => {
    const response = await POST(post({ event: "cta_99_click", path: "/" }));
    expect(response.status).toBe(200);
    expect(prisma.analyticsDailyCount.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.analyticsDailyCount.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ eventName: "cta_99_click", count: 1 }),
        update: { count: { increment: 1 } },
      })
    );
  });

  it("records an insight read by canonical slug", async () => {
    const response = await POST(
      post({
        event: "insight_read",
        slug: "grok-team-bots-shared-ai-coworkers-smb",
        path: "/insights/grok-team-bots-shared-ai-coworkers",
      })
    );
    expect(response.status).toBe(200);
    expect(prisma.analyticsDailyCount.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          eventName: "insight_read:grok-team-bots-shared-ai-coworkers",
        }),
      })
    );
  });

  it("does not write for bots, admin referrers, disabled analytics, or a client contact event", async () => {
    const bot = await POST(
      post(
        { event: "cta_99_click", path: "/" },
        { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }
      )
    );
    const admin = await POST(
      post(
        { event: "insight_read", slug: "example-article", path: "/insights/example-article" },
        { referer: "https://cerpamedia.com/admin/insights" }
      )
    );
    vi.mocked(isAnalyticsEnabled).mockResolvedValue(false);
    const disabled = await POST(post({ event: "cta_99_click", path: "/services" }));
    vi.mocked(isAnalyticsEnabled).mockResolvedValue(true);
    const contact = await POST(post({ event: "contact_submit", path: "/contact" }));

    expect(bot.status).toBe(200);
    expect(admin.status).toBe(200);
    expect(disabled.status).toBe(200);
    expect(contact.status).toBe(400);
    expect(prisma.analyticsDailyCount.upsert).not.toHaveBeenCalled();
  });
});
