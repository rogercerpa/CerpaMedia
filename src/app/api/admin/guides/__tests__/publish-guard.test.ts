import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PUT } from "@/app/api/admin/guides/[id]/route";
import { prisma } from "@/lib/prisma";
import { getAdminActor } from "@/lib/auth";
import { linkedSourcesForGuide } from "@/lib/sources";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    guide: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    guideSection: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getAdminActor: vi.fn(),
}));

vi.mock("@/lib/sources", () => ({
  SOURCE_TARGET: { guide: "guide", guide_section: "guide_section" },
  replaceSourceLinks: vi.fn(),
  linkedSourcesForGuide: vi.fn(),
}));

describe("PUT /api/admin/guides/[id] publish guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.guide.findUnique).mockResolvedValue({
      id: "guide-1",
      slug: "run-on-ai",
      status: "approved",
    } as never);
  });

  it("rejects a non-owner publish on the server", async () => {
    vi.mocked(getAdminActor).mockResolvedValue({
      email: "editor@cerpamedia.test",
      role: "editor",
    });

    const request = new NextRequest("http://localhost:3000/api/admin/guides/guide-1", {
      method: "PUT",
      body: JSON.stringify({
        title: "How any small business runs on AI",
        slug: "run-on-ai",
        industry: "general",
        summaryBox: "Summary",
        status: "published",
        sourceIds: [],
        sections: [],
      }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "guide-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toMatch(/only the owner can publish/i);
    expect(prisma.guide.update).not.toHaveBeenCalled();
  });

  it("rejects owner publish when a linked source is still to-verify", async () => {
    vi.mocked(getAdminActor).mockResolvedValue({
      email: "cerpamedia@gmail.com",
      role: "owner",
    });
    vi.mocked(linkedSourcesForGuide).mockResolvedValue([
      { id: "src-1", status: "to_verify" },
    ]);

    const request = new NextRequest("http://localhost:3000/api/admin/guides/guide-1", {
      method: "PUT",
      body: JSON.stringify({
        title: "How any small business runs on AI",
        slug: "run-on-ai",
        industry: "general",
        summaryBox: "Summary",
        status: "published",
        sourceIds: ["src-1"],
        sections: [],
      }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "guide-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toMatch(/to-verify/i);
    expect(prisma.guide.update).not.toHaveBeenCalled();
  });
});
