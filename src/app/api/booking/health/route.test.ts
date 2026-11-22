import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    availabilityRule: { findMany: vi.fn() },
    blockedDate: { findMany: vi.fn() },
    dateAvailability: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
    bookingSettings: { findMany: vi.fn() },
    launchPurchase: { findMany: vi.fn() },
  },
}));

const relations = [
  "availabilityRule",
  "blockedDate",
  "dateAvailability",
  "booking",
  "bookingSettings",
  "launchPurchase",
] as const;

describe("GET /api/booking/health", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL =
      "postgresql://app:secret-password@ep-muddy-forest.example.net:5432/cerpamedia?sslmode=require";
    for (const relation of relations) {
      vi.mocked(prisma[relation].findMany).mockResolvedValue([]);
    }
  });

  it("returns only ok when every booking relation can be read", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok" });
    expect(Object.keys(body)).toEqual(["status"]);
    expect(JSON.stringify(body)).not.toContain("ep-muddy-forest");
    expect(JSON.stringify(body)).not.toContain("secret-password");
    expect(JSON.stringify(body)).not.toContain("DATABASE_URL");
  });

  it("returns only degraded when a relation cannot be read", async () => {
    vi.mocked(prisma.booking.findMany).mockRejectedValue(new Error("connect ECONNREFUSED ep-muddy-forest.example.net"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "degraded" });
    expect(JSON.stringify(body)).not.toContain("ep-muddy-forest");
    expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });
});
