import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, eachDayOfInterval, isWeekend, parseISO } from "date-fns";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operation, dates, startDate, endDate, startTime, endTime, timezone, weekdaysOnly } = body;

    if (!operation || !startTime || !endTime) {
      return NextResponse.json(
        { error: "operation, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Times must be in HH:MM format" },
        { status: 400 }
      );
    }

    let datesToCreate: Date[] = [];

    switch (operation) {
      case "multi_date":
        if (!dates || !Array.isArray(dates) || dates.length === 0) {
          return NextResponse.json(
            { error: "dates array is required for multi_date operation" },
            { status: 400 }
          );
        }
        datesToCreate = dates.map((d) => new Date(d));
        break;

      case "date_range":
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "startDate and endDate are required for date_range operation" },
            { status: 400 }
          );
        }
        
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        
        if (start > end) {
          return NextResponse.json(
            { error: "startDate must be before or equal to endDate" },
            { status: 400 }
          );
        }

        const allDaysInRange = eachDayOfInterval({ start, end });
        datesToCreate = weekdaysOnly 
          ? allDaysInRange.filter(day => !isWeekend(day))
          : allDaysInRange;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid operation. Use 'multi_date' or 'date_range'" },
          { status: 400 }
        );
    }

    if (datesToCreate.length === 0) {
      return NextResponse.json(
        { error: "No dates to create" },
        { status: 400 }
      );
    }

    if (datesToCreate.length > 365) {
      return NextResponse.json(
        { error: "Too many dates. Maximum 365 dates per request" },
        { status: 400 }
      );
    }

    const createPromises = datesToCreate.map((date) =>
      prisma.dateAvailability.create({
        data: {
          date,
          startTime,
          endTime,
          timezone: timezone || "America/New_York",
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
      total: datesToCreate.length,
      message: `Created ${succeeded} date availabilities${failed > 0 ? ` (${failed} failed, possibly duplicates)` : ""}`,
    });
  } catch (error: any) {
    console.error("Error creating bulk date availabilities:", error);

    if (error.code === "P2021") {
      return NextResponse.json(
        {
          error: "DateAvailability table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING",
          details: "The database schema needs to be updated to include the DateAvailability table.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create bulk date availabilities" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, startDate, endDate } = body;

    if (!ids && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: "Either ids array or startDate+endDate range is required" },
        { status: 400 }
      );
    }

    if (ids) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "ids must be a non-empty array" },
          { status: 400 }
        );
      }

      const result = await prisma.dateAvailability.deleteMany({
        where: { id: { in: ids } },
      });

      return NextResponse.json({
        success: true,
        deleted: result.count,
        message: `Deleted ${result.count} date availabilities`,
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return NextResponse.json(
          { error: "startDate must be before or equal to endDate" },
          { status: 400 }
        );
      }

      const result = await prisma.dateAvailability.deleteMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      return NextResponse.json({
        success: true,
        deleted: result.count,
        message: `Deleted ${result.count} date availabilities`,
      });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error deleting bulk date availabilities:", error);

    if (error.code === "P2021") {
      return NextResponse.json(
        {
          error: "DateAvailability table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bulk date availabilities" },
      { status: 500 }
    );
  }
}
