import { NextRequest, NextResponse } from "next/server";
import { getPublicDemoPayload } from "@/lib/demo";
import { checkRateLimit } from "@/lib/security";
import { incrementAnalyticsEvent } from "@/lib/analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const rateLimit = checkRateLimit({
    identifier: `demo-public:${ip}`,
    maxRequests: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const payload = await getPublicDemoPayload(slug);
  if (!payload) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  try {
    await incrementAnalyticsEvent("demo_run");
  } catch {
    // ignore count failures
  }
  return NextResponse.json(payload);
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Visitors cannot trigger AI generation. Phase 0 serves replays and cached samples only.",
    },
    { status: 405 }
  );
}
