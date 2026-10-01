import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let settings = await prisma.bookingSettings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.bookingSettings.create({
        data: {
          id: "default",
          slotLengthMin: 60,
          bufferMin: 15,
          minLeadTimeHrs: 24,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching booking settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slotLengthMin, bufferMin, minLeadTimeHrs } = body;

    // Validate inputs
    if (slotLengthMin !== undefined && (slotLengthMin < 1 || slotLengthMin > 480)) {
      return NextResponse.json(
        { error: "slotLengthMin must be between 1 and 480 minutes" },
        { status: 400 }
      );
    }

    if (bufferMin !== undefined && (bufferMin < 0 || bufferMin > 120)) {
      return NextResponse.json(
        { error: "bufferMin must be between 0 and 120 minutes" },
        { status: 400 }
      );
    }

    if (minLeadTimeHrs !== undefined && (minLeadTimeHrs < 0 || minLeadTimeHrs > 168)) {
      return NextResponse.json(
        { error: "minLeadTimeHrs must be between 0 and 168 hours" },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await prisma.bookingSettings.findFirst();

    if (!settings) {
      settings = await prisma.bookingSettings.create({
        data: {
          id: "default",
          slotLengthMin: slotLengthMin ?? 60,
          bufferMin: bufferMin ?? 15,
          minLeadTimeHrs: minLeadTimeHrs ?? 24,
        },
      });
    } else {
      settings = await prisma.bookingSettings.update({
        where: { id: settings.id },
        data: {
          ...(slotLengthMin !== undefined && { slotLengthMin }),
          ...(bufferMin !== undefined && { bufferMin }),
          ...(minLeadTimeHrs !== undefined && { minLeadTimeHrs }),
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating booking settings:", error);
    return NextResponse.json(
      { error: "Failed to update booking settings" },
      { status: 500 }
    );
  }
}
