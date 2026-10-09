import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { assertPublishAllowed } from "@/lib/publishing";

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
      slug,
      title,
      description,
      enabled = true,
      status = "draft",
      replayScript,
      restingMessage,
      samples = [],
    } = body;

    if (!slug || !title || !description || !replayScript) {
      return jsonError("Slug, title, description, and replay script are required.", 400);
    }

    const existing = await prisma.demo.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Demo not found.", 404);
    }

    if (slug !== existing.slug) {
      const taken = await prisma.demo.findUnique({ where: { slug } });
      if (taken) {
        return jsonError("A demo with this slug already exists.", 400);
      }
    }

    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    await prisma.demoSample.deleteMany({ where: { demoId: id } });

    let publishedAt = existing.publishedAt;
    if (status === "published" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status !== "published") {
      publishedAt = null;
    }

    const demo = await prisma.demo.update({
      where: { id },
      data: {
        slug,
        title,
        description,
        enabled: Boolean(enabled),
        status,
        publishedAt,
        replayScript,
        restingMessage: restingMessage || "Demo resting, back tomorrow.",
        samples: {
          create: (samples as Array<Record<string, string | number>>).map(
            (sample, index) => ({
              label: String(sample.label || `Sample ${index + 1}`),
              inputText: String(sample.inputText || ""),
              cachedOutput: sample.cachedOutput
                ? String(sample.cachedOutput)
                : null,
              generatedAt: sample.generatedAt
                ? new Date(String(sample.generatedAt))
                : null,
              sortOrder: Number(sample.sortOrder ?? index),
            })
          ),
        },
      },
      include: { samples: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ demo });
  } catch (error) {
    console.error("Error updating demo:", error);
    return jsonError("Failed to update demo.", 500);
  }
}
