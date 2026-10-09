import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { SOURCE_STATUSES, type SourceStatus } from "@/lib/publishing";

function parseStatus(value: unknown): SourceStatus {
  if (typeof value === "string" && SOURCE_STATUSES.includes(value as SourceStatus)) {
    return value as SourceStatus;
  }
  return "to_verify";
}

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
      title,
      publisher,
      publishedDate,
      url,
      exactClaim,
      notes,
      status,
      nextReviewAt,
    } = body;

    if (!title || !publisher || !url) {
      return jsonError("Title, publisher, and URL are required.", 400);
    }

    const existing = await prisma.source.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Source not found.", 404);
    }

    const parsedStatus = parseStatus(status);
    const source = await prisma.source.update({
      where: { id },
      data: {
        title,
        publisher,
        publishedDate: publishedDate || null,
        url,
        exactClaim: exactClaim || null,
        notes: notes || null,
        status: parsedStatus,
        verifiedBy:
          parsedStatus === "verified" ? auth.actor.email : existing.verifiedBy,
        verifiedAt:
          parsedStatus === "verified"
            ? existing.verifiedAt ?? new Date()
            : null,
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : null,
      },
    });

    return NextResponse.json({ source });
  } catch (error) {
    console.error("Error updating source:", error);
    return jsonError("Failed to update source.", 500);
  }
}
