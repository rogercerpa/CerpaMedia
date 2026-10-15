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

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  const sources = await prisma.source.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ sources, role: auth.actor.role });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  try {
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

    const parsedStatus = parseStatus(status);
    const source = await prisma.source.create({
      data: {
        title,
        publisher,
        publishedDate: publishedDate || null,
        url,
        exactClaim: exactClaim || null,
        notes: notes || null,
        status: parsedStatus,
        verifiedBy:
          parsedStatus === "verified" ? auth.actor.email : null,
        verifiedAt: parsedStatus === "verified" ? new Date() : null,
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : null,
      },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return jsonError("Failed to create source.", 500);
  }
}
