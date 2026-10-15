import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { assertPublishAllowed } from "@/lib/publishing";
import {
  linkedSourcesForGuide,
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

    const existing = await prisma.guide.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Guide not found.", 404);
    }

    if (slug !== existing.slug) {
      const taken = await prisma.guide.findUnique({ where: { slug } });
      if (taken) {
        return jsonError("A guide with this slug already exists.", 400);
      }
    }

    await replaceSourceLinks({
      targetType: SOURCE_TARGET.guide,
      targetId: id,
      sourceIds: Array.isArray(sourceIds) ? sourceIds : [],
    });

    const linkedSources = await linkedSourcesForGuide(id);
    const guard = assertPublishAllowed({
      role: auth.actor.role,
      nextStatus: status,
      linkedSources,
    });
    if (!guard.ok) return jsonError(guard.error, guard.status);

    await prisma.guideSection.deleteMany({ where: { guideId: id } });

    let publishedAt = existing.publishedAt;
    if (status === "published" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status !== "published") {
      publishedAt = null;
    }

    const guide = await prisma.guide.update({
      where: { id },
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
        reviewedAt: reviewStamp ? new Date() : existing.reviewedAt,
        status,
        publishedAt,
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

    return NextResponse.json({ guide });
  } catch (error) {
    console.error("Error updating guide:", error);
    return jsonError("Failed to update guide.", 500);
  }
}
