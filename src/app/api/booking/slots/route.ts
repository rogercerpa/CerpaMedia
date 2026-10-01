import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam) {
      return NextResponse.json(
        { error: "Missing 'start' parameter" },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'start' date format" },
        { status: 400 }
      );
    }

    let endDate: Date;
    if (endParam) {
      endDate = new Date(endParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid 'end' date format" },
          { status: 400 }
        );
      }
    } else {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 21);
    }

    const slots = await getAvailableSlots(startDate, endDate);

    return NextResponse.json({
      slots: slots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
