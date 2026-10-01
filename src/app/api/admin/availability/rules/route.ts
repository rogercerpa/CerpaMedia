import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching availability rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability rules" },
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
    const { weekday, startTime, endTime, timezone } = body;

    if (
      weekday === undefined ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "weekday, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    // Validate weekday (0-6)
    if (weekday < 0 || weekday > 6) {
      return NextResponse.json(
        { error: "weekday must be between 0 and 6" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Times must be in HH:MM format" },
        { status: 400 }
      );
    }

    const rule = await prisma.availabilityRule.create({
      data: {
        weekday,
        startTime,
        endTime,
        timezone: timezone || "America/New_York",
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating availability rule:", error);
    return NextResponse.json(
      { error: "Failed to create availability rule" },
      { status: 500 }
    );
  }
}
