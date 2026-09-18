import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await clearAdminSessionCookie();

    return NextResponse.json({
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
