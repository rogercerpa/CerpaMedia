import { NextRequest, NextResponse } from "next/server";
import { incrementAnalyticsEvent } from "@/lib/analytics";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const rateLimit = checkRateLimit({
    identifier: `analytics:${ip}`,
    maxRequests: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: true });
  }

  let eventName = "";
  try {
    const body = await request.json();
    eventName = typeof body?.event === "string" ? body.event : "";
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const result = await incrementAnalyticsEvent(eventName);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
