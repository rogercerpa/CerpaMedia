import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicDemoPage from "@/app/try/[slug]/page";
import { getPublicDemoPayload } from "@/lib/demo";

vi.mock("@/lib/demo", () => ({
  getPublicDemoPayload: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  incrementAnalyticsEvent: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    const error = new Error("NEXT_NOT_FOUND");
    throw error;
  },
}));

describe("public /try/[slug] visitor gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("404s for a visitor with no session when the demo is not public", async () => {
    vi.mocked(getPublicDemoPayload).mockResolvedValue(null);
    await expect(
      PublicDemoPage({ params: Promise.resolve({ slug: "inbox-rescue" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
