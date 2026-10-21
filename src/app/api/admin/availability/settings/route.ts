import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingRelationError } from "@/lib/db-errors";
import { getLaunchSetupLengthMin, saveLaunchSetupLengthMin } from "@/lib/launch-booking";
import { DEFAULT_LAUNCH_SETUP_LENGTH_MIN } from "@/lib/launch-booking-shared";

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

    const launchSetupLengthMin = await getLaunchSetupLengthMin();

    return NextResponse.json({ ...settings, launchSetupLengthMin });
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
    const { slotLengthMin, bufferMin, minLeadTimeHrs, launchSetupLengthMin } = body;

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

    if (
      launchSetupLengthMin !== undefined &&
      (!Number.isInteger(launchSetupLengthMin) ||
        launchSetupLengthMin < 15 ||
        launchSetupLengthMin > 480)
    ) {
      return NextResponse.json(
        { error: "launchSetupLengthMin must be between 15 and 480 minutes" },
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

    let savedLaunchLength = DEFAULT_LAUNCH_SETUP_LENGTH_MIN;
    let warning: string | undefined;
    if (launchSetupLengthMin !== undefined) {
      try {
        savedLaunchLength = await saveLaunchSetupLengthMin(launchSetupLengthMin);
      } catch (error) {
        if (!isMissingRelationError(error)) throw error;
        warning =
          "Setup-session length stays at 90 minutes until the launch database migration is applied.";
        savedLaunchLength = DEFAULT_LAUNCH_SETUP_LENGTH_MIN;
      }
    } else {
      savedLaunchLength = await getLaunchSetupLengthMin();
    }

    return NextResponse.json({
      ...settings,
      launchSetupLengthMin: savedLaunchLength,
      ...(warning ? { warning } : {}),
    });
  } catch (error) {
    console.error("Error updating booking settings:", error);
    return NextResponse.json(
      { error: "Failed to update booking settings" },
      { status: 500 }
    );
  }
}
