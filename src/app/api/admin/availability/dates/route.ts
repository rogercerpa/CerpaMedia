import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dates = await prisma.dateAvailability.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(dates);
  } catch (error: any) {
    console.error("Error fetching date availabilities:", error);
    
    if (error.code === "P2021") {
      return NextResponse.json(
        { 
          error: "DateAvailability table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING",
          details: "The database schema needs to be updated to include the DateAvailability table."
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch date availabilities" },
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
    const { date, startTime, endTime, timezone } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "date, startTime, and endTime are required" },
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

    const dateAvail = await prisma.dateAvailability.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        timezone: timezone || "America/New_York",
      },
    });

    return NextResponse.json(dateAvail, { status: 201 });
  } catch (error: any) {
    console.error("Error creating date availability:", error);
    
    if (error.code === "P2021") {
      return NextResponse.json(
        { 
          error: "DateAvailability table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING",
          details: "The database schema needs to be updated to include the DateAvailability table."
        },
        { status: 503 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A date availability entry with this date and time already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create date availability" },
      { status: 500 }
    );
  }
}
