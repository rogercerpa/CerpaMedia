import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDemoPreviewPage from "@/app/admin/preview/demo/[slug]/page";
import AdminDemoFallbackPreviewPage from "@/app/admin/preview/demo-fallback/page";
import { getAdminActor } from "@/lib/auth";
import { getAdminDemoPayload } from "@/lib/demo";

vi.mock("@/lib/auth", () => ({
  getAdminActor: vi.fn(),
}));

vi.mock("@/lib/demo", () => ({
  getAdminDemoPayload: vi.fn(),
}));

vi.mock("@/components/admin/AdminChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/DemoPlayer", () => ({
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("admin demo preview requires a session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminDemoPayload).mockResolvedValue({
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
      samples: [],
    });
  });

  it("redirects /admin/preview/demo/[slug] to login without a session", async () => {
    vi.mocked(getAdminActor).mockResolvedValue(null);
    await expect(
      AdminDemoPreviewPage({
        params: Promise.resolve({ slug: "inbox-rescue" }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(getAdminDemoPayload).not.toHaveBeenCalled();
  });

  it("redirects /admin/preview/demo-fallback to login without a session", async () => {
    vi.mocked(getAdminActor).mockResolvedValue(null);
    await expect(AdminDemoFallbackPreviewPage()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login"
    );
    expect(getAdminDemoPayload).not.toHaveBeenCalled();
  });
});
