import { NextRequest, NextResponse } from "next/server";
import { recordTrackedEvent } from "@/lib/analytics";
import {
  resolveClientAnalyticsEvent,
  safeAnalyticsPath,
  trackContextFromHeaders,
} from "@/lib/analytics-events";
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

  let body: { event?: unknown; slug?: unknown; path?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventName = resolveClientAnalyticsEvent(body);
  if (!eventName) {
    return NextResponse.json({ error: "Unknown event." }, { status: 400 });
  }

  const context = trackContextFromHeaders(request.headers, safeAnalyticsPath(body.path));
  const result = await recordTrackedEvent(eventName, context);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
