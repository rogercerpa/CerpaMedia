import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { getSiteFlags } from "@/lib/flags";
import { assertPublishAllowed } from "@/lib/publishing";

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  const [demos, flags] = await Promise.all([
    prisma.demo.findMany({
      orderBy: { title: "asc" },
      include: { samples: { orderBy: { sortOrder: "asc" } } },
    }),
    getSiteFlags(),
  ]);

  return NextResponse.json({
    demos,
    flags,
    role: auth.actor.role,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  try {
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

    const existing = await prisma.demo.findUnique({ where: { slug } });
    if (existing) {
      return jsonError("A demo with this slug already exists.", 400);
    }

    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    const demo = await prisma.demo.create({
      data: {
        slug,
        title,
        description,
        enabled: Boolean(enabled),
        status,
        publishedAt: status === "published" ? new Date() : null,
        replayScript,
        restingMessage:
          restingMessage || "This demo is paused. Showing the recorded replay.",
        samples: {
          create: (samples as Array<Record<string, string | number>>).map(
            (sample, index) => ({
              label: String(sample.label || `Sample ${index + 1}`),
              inputText: String(sample.inputText || ""),
              cachedOutput: sample.cachedOutput
                ? String(sample.cachedOutput)
                : null,
              sortOrder: Number(sample.sortOrder ?? index),
            })
          ),
        },
      },
      include: { samples: true },
    });

    return NextResponse.json({ demo }, { status: 201 });
  } catch (error) {
    console.error("Error creating demo:", error);
    return jsonError("Failed to create demo.", 500);
  }
}
