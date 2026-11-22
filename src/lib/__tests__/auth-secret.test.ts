import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminSession: { create: vi.fn(), findUnique: vi.fn() },
    adminUser: { findUnique: vi.fn() },
    magicLinkToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { createAdminSession, verifyAdminSession } from "../auth";

describe("AUTH_SECRET", () => {
  const original = process.env.AUTH_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = original;
    }
  });

  it("throws instead of signing with a fallback secret", async () => {
    delete process.env.AUTH_SECRET;

    await expect(createAdminSession("owner@example.com")).rejects.toThrow(
      /AUTH_SECRET is not set/
    );
    await expect(verifyAdminSession("not-a-session")).rejects.toThrow(
      /AUTH_SECRET is not set/
    );
  });

  it("rejects a blank secret", async () => {
    process.env.AUTH_SECRET = "   ";

    await expect(createAdminSession("owner@example.com")).rejects.toThrow(
      /AUTH_SECRET is not set/
    );
  });

  it("does not keep a hardcoded default in the auth module", () => {
    const source = readFileSync(path.join(__dirname, "../auth.ts"), "utf8");
    expect(source).not.toContain("default-secret-change-in-production");
  });
});
