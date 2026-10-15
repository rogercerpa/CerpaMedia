import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { assertPublishAllowed } from "@/lib/publishing";
import {
  linkedSourcesFor,
  replaceSourceLinks,
  SOURCE_TARGET,
} from "@/lib/sources";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
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

    const existing = await prisma.timelineEntry.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Timeline entry not found.", 404);
    }

    await replaceSourceLinks({
      targetType: SOURCE_TARGET.timeline,
      targetId: id,
      sourceIds: Array.isArray(sourceIds) ? sourceIds : [],
    });

    const linkedSources = await linkedSourcesFor(SOURCE_TARGET.timeline, id);
    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
      linkedSources,
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    let publishedAt = existing.publishedAt;
    if (status === "published" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status !== "published") {
      publishedAt = null;
    }

    const entry = await prisma.timelineEntry.update({
      where: { id },
      data: { timeframe, industry, title, text, status, publishedAt },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error updating timeline entry:", error);
    return jsonError("Failed to update timeline entry.", 500);
  }
}
