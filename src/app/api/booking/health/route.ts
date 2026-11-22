import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Booking database health check.
 * Returns only ok or degraded. No hostnames, errors, or table names.
 */
async function relationOk(check: () => Promise<unknown>): Promise<boolean> {
  try {
    await check();
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const checks = await Promise.all([
    relationOk(() => prisma.availabilityRule.findMany({ take: 1 })),
    relationOk(() => prisma.blockedDate.findMany({ take: 1 })),
    relationOk(() => prisma.dateAvailability.findMany({ take: 1 })),
    relationOk(() => prisma.booking.findMany({ take: 1 })),
    relationOk(() => prisma.bookingSettings.findMany({ take: 1 })),
    relationOk(() => prisma.launchPurchase.findMany({ take: 1 })),
  ]);

  return NextResponse.json({
    status: checks.every(Boolean) ? "ok" : "degraded",
  });
}
