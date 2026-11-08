import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getCanonicalSlug, getOldSlug } from "@/lib/insight-slug-aliases";
import { presentInsight } from "@/lib/reword-small-business";
import { conciseText } from "@/lib/seo-copy";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "CerpaMedia Insights";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function articleTitle(slug: string): Promise<string> {
  const canonical = getCanonicalSlug(slug);
  let post = await prisma.insightPost.findFirst({
    where: { slug: canonical, status: "published", publishedAt: { not: null } },
    select: { slug: true, title: true, summary: true, tags: true },
  });
  if (!post) {
    const oldSlug = getOldSlug(slug);
    if (oldSlug) {
      post = await prisma.insightPost.findFirst({
        where: { slug: oldSlug, status: "published", publishedAt: { not: null } },
        select: { slug: true, title: true, summary: true, tags: true },
      });
    }
  }
  if (!post) return "Insights";
  return conciseText(presentInsight({ ...post, body: "" }).title, 110);
}

export default async function InsightOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let title = "Insights";
  try {
    title = await articleTitle(slug);
  } catch (error) {
    console.error("Insight share image fell back to the default title:", error);
  }

  return new ImageResponse(<OgCard kicker="Insights" title={title} detail="cerpamedia.com/insights" />, {
    ...size,
  });
}
