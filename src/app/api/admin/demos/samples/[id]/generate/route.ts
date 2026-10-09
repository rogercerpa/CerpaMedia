import { NextRequest, NextResponse } from "next/server";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { generateSampleOutput } from "@/lib/demo";
import { checkRateLimit } from "@/lib/security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const rateLimit = checkRateLimit({
    identifier: `demo-generate:${auth.actor.email}:${ip}`,
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many generate requests. Try again later.", 429);
  }

  const { id } = await params;
  const result = await generateSampleOutput({
    sampleId: id,
    isAdmin: true,
  });

  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return NextResponse.json(result);
}
