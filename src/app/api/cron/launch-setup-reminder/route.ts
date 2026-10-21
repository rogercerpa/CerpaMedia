import { NextRequest, NextResponse } from "next/server";
import { sendDueLaunchSetupReminders } from "@/lib/launch-purchase";

export const dynamic = "force-dynamic";

/** Daily Vercel Cron. One reminder per unbooked Launch purchase, after 2 Eastern business days. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 401 });
  }

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDueLaunchSetupReminders();
    if (result.failed > 0) {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Launch setup reminder cron failed:", error);
    return NextResponse.json({ error: "Reminder cron failed" }, { status: 500 });
  }
}
