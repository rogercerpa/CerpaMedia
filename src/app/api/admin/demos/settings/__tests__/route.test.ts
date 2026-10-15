import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { PUT } from "@/app/api/admin/demos/settings/route";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteSetting: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getAdminActor: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const savedFlags = {
  id: "default",
  foundationsUiEnabled: true,
  analyticsEnabled: true,
  demosPublicEnabled: false,
  demoKillSwitch: true,
};

function putRequest() {
  return new NextRequest("http://localhost:3000/api/admin/demos/settings", {
    method: "PUT",
    body: JSON.stringify({
      foundationsUiEnabled: true,
      analyticsEnabled: true,
      demosPublicEnabled: false,
      demoKillSwitch: true,
    }),
  });
}

describe("PUT /api/admin/demos/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates the root layout after a successful site setting update", async () => {
    vi.mocked(getAdminActor).mockResolvedValue({
      email: "cerpamedia@gmail.com",
      role: "owner",
    });
    vi.mocked(prisma.siteSetting.upsert).mockResolvedValue(savedFlags as never);

    const response = await PUT(putRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.flags).toEqual(savedFlags);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("does not revalidate when a non-owner is rejected", async () => {
    vi.mocked(getAdminActor).mockResolvedValue({
      email: "editor@cerpamedia.test",
      role: "editor",
    });

    const response = await PUT(putRequest());

    expect(response.status).toBe(403);
    expect(prisma.siteSetting.upsert).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not revalidate when the update fails", async () => {
    vi.mocked(getAdminActor).mockResolvedValue({
      email: "cerpamedia@gmail.com",
      role: "owner",
    });
    vi.mocked(prisma.siteSetting.upsert).mockRejectedValue(new Error("db down"));

    const response = await PUT(putRequest());

    expect(response.status).toBe(500);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
