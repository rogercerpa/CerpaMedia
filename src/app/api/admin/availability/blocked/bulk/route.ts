import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUSHolidays, getUSFederalHolidays } from "@/lib/holidays";
import { formatCalendarDate, parseCalendarDate } from "@/lib/calendar-date";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { year, federalOnly, customDates } = body;

    if (!year && !customDates) {
      return NextResponse.json(
        { error: "Either year or customDates is required" },
        { status: 400 }
      );
    }

    let datesToBlock: Array<{ date: Date; reason: string }> = [];

    if (year) {
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1 || year > currentYear + 10) {
        return NextResponse.json(
          { error: "Year must be within range of current year -1 to +10" },
          { status: 400 }
        );
      }

      const holidays = federalOnly 
        ? getUSFederalHolidays(year)
        : getUSHolidays(year);

      datesToBlock = holidays.map((h) => ({
        date: h.date,
        reason: h.name,
      }));
    }

    if (customDates && Array.isArray(customDates)) {
      const customBlocks = customDates.map((d: { date: string; reason?: string }) => ({
        date: parseCalendarDate(d.date), // Parse string dates to Date objects at noon UTC
        reason: d.reason || "Custom block",
      }));
      datesToBlock = [...datesToBlock, ...customBlocks];
    }

    if (datesToBlock.length === 0) {
      return NextResponse.json(
        { error: "No dates to block" },
        { status: 400 }
      );
    }

    if (datesToBlock.length > 100) {
      return NextResponse.json(
        { error: "Too many dates. Maximum 100 dates per request" },
        { status: 400 }
      );
    }

    const createPromises = datesToBlock.map(({ date, reason }) =>
      prisma.blockedDate.create({
        data: { 
          date, // Already a Date object at noon UTC
          reason 
        },
      })
    );

    const results = await Promise.allSettled(createPromises);

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      created: succeeded,
      failed,
      total: datesToBlock.length,
      message: `Blocked ${succeeded} dates${failed > 0 ? ` (${failed} failed, possibly duplicates)` : ""}`,
      dates: datesToBlock.map(d => ({
        date: formatCalendarDate(d.date),
        reason: d.reason
      }))
    });
  } catch (error: any) {
    console.error("Error blocking bulk dates:", error);

    if (error.code === "P2021") {
      return NextResponse.json(
        {
          error: "BlockedDate table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to block bulk dates" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const federalOnlyParam = searchParams.get("federalOnly");

    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const federalOnly = federalOnlyParam === "true";

    const holidays = federalOnly 
      ? getUSFederalHolidays(year)
      : getUSHolidays(year);

    return NextResponse.json({
      year,
      federalOnly,
      holidays: holidays.map((h) => ({
        date: formatCalendarDate(h.date),
        name: h.name,
        federal: h.federal,
      })),
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}
