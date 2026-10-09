import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { assertPublishAllowed } from "@/lib/publishing";
import { replaceSourceLinks, SOURCE_TARGET } from "@/lib/sources";

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  const entries = await prisma.timelineEntry.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ entries, role: auth.actor.role });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const {
      timeframe,
      industry = "general",
      title,
      text,
      status = "draft",
      sourceIds = [],
    } = body;

    if (!timeframe || !title || !text) {
      return jsonError("Timeframe, title, and text are required.", 400);
    }

    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
      linkedSources: [],
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    const entry = await prisma.timelineEntry.create({
      data: {
        timeframe,
        industry,
        title,
        text,
        status,
        publishedAt: status === "published" ? new Date() : null,
      },
    });

    await replaceSourceLinks({
      targetType: SOURCE_TARGET.timeline,
      targetId: entry.id,
      sourceIds: Array.isArray(sourceIds) ? sourceIds : [],
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    return jsonError("Failed to create timeline entry.", 500);
  }
}
