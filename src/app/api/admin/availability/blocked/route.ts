import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCalendarDate, formatCalendarDate } from "@/lib/calendar-date";

export async function GET() {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { date: "asc" },
    });

    // Format dates correctly for UI (avoid timezone shift)
    const formattedDates = blockedDates.map((d) => ({
      ...d,
      date: formatCalendarDate(d.date),
    }));

    return NextResponse.json(formattedDates);
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked dates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json(
        { error: "date is required" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: parseCalendarDate(date),
        reason: reason || null,
      },
    });

    // Format date correctly for UI response
    const formattedBlockedDate = {
      ...blockedDate,
      date: formatCalendarDate(blockedDate.date),
    };

    return NextResponse.json(formattedBlockedDate, { status: 201 });
  } catch (error) {
    console.error("Error creating blocked date:", error);
    return NextResponse.json(
      { error: "Failed to create blocked date" },
      { status: 500 }
    );
  }
}
