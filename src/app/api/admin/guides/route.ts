import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { assertPublishAllowed } from "@/lib/publishing";
import { replaceSourceLinks, SOURCE_TARGET } from "@/lib/sources";

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  const guides = await prisma.guide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ guides, role: auth.actor.role });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const {
      title,
      slug,
      industry = "general",
      summaryBox,
      rogerNote,
      rogerStory,
      seoTitle,
      seoDescription,
      reviewStamp,
      status = "draft",
      sourceIds = [],
      sections = [],
    } = body;

    if (!title || !slug || !summaryBox) {
      return jsonError("Title, slug, and summary are required.", 400);
    }

    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
      linkedSources: [],
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    const existing = await prisma.guide.findUnique({ where: { slug } });
    if (existing) {
      return jsonError("A guide with this slug already exists.", 400);
    }

    const guide = await prisma.guide.create({
      data: {
        title,
        slug,
        industry,
        summaryBox,
        rogerNote: rogerNote || null,
        rogerStory: rogerStory || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        reviewStamp: reviewStamp || null,
        reviewedAt: reviewStamp ? new Date() : null,
        status,
        publishedAt: status === "published" ? new Date() : null,
        sections: {
          create: (sections as Array<Record<string, string | number>>).map(
            (section, index) => ({
              sortOrder: Number(section.sortOrder ?? index),
              title: String(section.title || `Section ${index + 1}`),
              job: String(section.job || ""),
              todaySteps: String(section.todaySteps || ""),
              tryItDemoSlug: section.tryItDemoSlug
                ? String(section.tryItDemoSlug)
                : null,
              whatStaysHuman: String(section.whatStaysHuman || ""),
              todayText: String(section.todayText || ""),
              years2to5Text: String(section.years2to5Text || ""),
              years5to10Text: String(section.years5to10Text || ""),
            })
          ),
        },
      },
    });

    await replaceSourceLinks({
      targetType: SOURCE_TARGET.guide,
      targetId: guide.id,
      sourceIds: Array.isArray(sourceIds) ? sourceIds : [],
    });

    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    console.error("Error creating guide:", error);
    return jsonError("Failed to create guide.", 500);
  }
}
