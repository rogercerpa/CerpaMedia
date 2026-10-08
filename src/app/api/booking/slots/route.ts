import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, AvailabilityError } from "@/lib/availability";

// Force dynamic rendering to prevent stale cached availability
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam) {
      return NextResponse.json(
        { error: "Missing 'start' parameter", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'start' date format", code: "INVALID_DATE" },
        { status: 400 }
      );
    }

    let endDate: Date;
    if (endParam) {
      endDate = new Date(endParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid 'end' date format", code: "INVALID_DATE" },
          { status: 400 }
        );
      }
    } else {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 21);
    }

    const slots = await getAvailableSlots(startDate, endDate);

    return NextResponse.json({
      count: slots.length,
      slots: slots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof AvailabilityError) {
      console.error(`[${error.code}] ${error.message}`, {
        code: error.code,
        prismaCode: error.prismaCode,
        hint: error.hint,
      });
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          prismaCode: error.prismaCode,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching available slots:", errorMessage, error);
    return NextResponse.json(
      {
        error: "Failed to fetch available slots",
        code: "SLOTS_QUERY_FAILED",
        hint: "Unexpected error - check server logs",
      },
      { status: 500 }
    );
  }
}
