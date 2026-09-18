import { NextRequest, NextResponse } from "next/server";
import {
  verifyMagicLinkToken,
  createAdminSession,
  setAdminSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const sessionToken = await createAdminSession(email);
    await setAdminSessionCookie(sessionToken);

    return NextResponse.json({
      message: "Successfully authenticated",
    });
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
