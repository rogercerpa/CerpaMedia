import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getDatabaseHost } from "@/lib/availability";

/**
 * Health check endpoint for booking system database tables
 * Returns existence status for each table without requiring secrets
 */
export async function GET() {
  const tables = {
    availabilityRule: false,
    blockedDate: false,
    booking: false,
    bookingSettings: false,
  };

  const dbHost = getDatabaseHost();

  // Check AvailabilityRule table
  try {
    await prisma.availabilityRule.findMany({ take: 1 });
    tables.availabilityRule = true;
  } catch (error) {
    // Table doesn't exist or query failed
    tables.availabilityRule = false;
  }

  // Check BlockedDate table
  try {
    await prisma.blockedDate.findMany({ take: 1 });
    tables.blockedDate = true;
  } catch (error) {
    tables.blockedDate = false;
  }

  // Check Booking table
  try {
    await prisma.booking.findMany({ take: 1 });
    tables.booking = true;
  } catch (error) {
    tables.booking = false;
  }

  // Check BookingSettings table
  try {
    await prisma.bookingSettings.findMany({ take: 1 });
    tables.bookingSettings = true;
  } catch (error) {
    tables.bookingSettings = false;
  }

  const allTablesExist = Object.values(tables).every((exists) => exists);

  return NextResponse.json({
    ok: allTablesExist,
    tables,
    dbHost,
    timestamp: new Date().toISOString(),
  });
}
