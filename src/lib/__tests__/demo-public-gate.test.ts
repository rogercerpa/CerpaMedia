import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_FLAGS } from "@/lib/flags";
import { getPublicDemoPayload } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getSiteFlags } from "@/lib/flags";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    demo: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/flags", async () => {
  const actual = await vi.importActual<typeof import("@/lib/flags")>(
    "@/lib/flags"
  );
  return {
    ...actual,
    getSiteFlags: vi.fn(),
  };
});

const seededDemo = {
  slug: "inbox-rescue",
  title: "Inbox Rescue",
  description: "Watch a reply appear.",
  enabled: true,
  status: "draft",
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
};

describe("public demo payload gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.demo.findUnique).mockResolvedValue(seededDemo as never);
  });

  it("returns null for a visitor when demosPublicEnabled is off", async () => {
    vi.mocked(getSiteFlags).mockResolvedValue({
      ...DEFAULT_SITE_FLAGS,
      demosPublicEnabled: false,
    });
    vi.mocked(prisma.demo.findUnique).mockResolvedValue({
      ...seededDemo,
      status: "published",
    } as never);

    await expect(getPublicDemoPayload("inbox-rescue")).resolves.toBeNull();
  });

  it("returns null for a visitor when the demo is not Published", async () => {
    vi.mocked(getSiteFlags).mockResolvedValue({
      ...DEFAULT_SITE_FLAGS,
      demosPublicEnabled: true,
    });
    vi.mocked(prisma.demo.findUnique).mockResolvedValue({
      ...seededDemo,
      status: "draft",
      enabled: true,
    } as never);

    await expect(getPublicDemoPayload("inbox-rescue")).resolves.toBeNull();
  });

  it("returns a payload only when Published and the public flag is on", async () => {
    vi.mocked(getSiteFlags).mockResolvedValue({
      ...DEFAULT_SITE_FLAGS,
      demosPublicEnabled: true,
    });
    vi.mocked(prisma.demo.findUnique).mockResolvedValue({
      ...seededDemo,
      status: "published",
    } as never);

    const payload = await getPublicDemoPayload("inbox-rescue");
    expect(payload?.slug).toBe("inbox-rescue");
    expect(payload?.samples[0]?.cachedOutput).toBe("Sorry — here's the plan.");
  });
});
