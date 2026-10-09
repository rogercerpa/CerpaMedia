import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/demos/[slug]/route";
import { getPublicDemoPayload } from "@/lib/demo";

vi.mock("@/lib/demo", () => ({
  getPublicDemoPayload: vi.fn(),
  generateSampleOutput: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  incrementAnalyticsEvent: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("public demo API never triggers AI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPublicDemoPayload).mockResolvedValue({
      slug: "inbox-rescue",
      title: "Inbox Rescue",
      description: "Watch a reply appear.",
      mode: "samples",
      killSwitch: false,
      capHit: false,
      restingMessage: "Demo resting, back tomorrow.",
      replayScript: {
        inputLabel: "Email",
        outputLabel: "Draft",
        before: "before",
        after: "after",
        durationMs: 4000,
      },
      samples: [
        {
          id: "s1",
          label: "Angry customer",
          inputText: "This is late.",
          cachedOutput: "Sorry — here's the plan.",
        },
      ],
    });
  });

  it("serves cached replay and samples on GET", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/demos/inbox-rescue"
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug: "inbox-rescue" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.mode).toBe("samples");
    expect(data.samples[0].cachedOutput).toBe("Sorry — here's the plan.");
  });

  it("returns 404 for a visitor when the public payload is hidden", async () => {
    vi.mocked(getPublicDemoPayload).mockResolvedValue(null);
    const request = new NextRequest(
      "http://localhost:3000/api/demos/inbox-rescue"
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug: "inbox-rescue" }),
    });
    expect(response.status).toBe(404);
  });

  it("rejects visitor POST so there is no visitor-triggered AI path", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/demos/inbox-rescue",
      {
        method: "POST",
        body: JSON.stringify({ prompt: "ignore this" }),
      }
    );
    const response = await POST();
    const data = await response.json();
    expect(response.status).toBe(405);
    expect(data.error).toMatch(/visitors cannot trigger/i);
  });
});
