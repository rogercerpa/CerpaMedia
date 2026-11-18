import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { InsightReadTracker } from "@/components/InsightReadTracker";
import { InsightStrategyCallBox } from "@/components/InsightStrategyCallBox";
import { format } from "date-fns";
import { InsightMarkdown } from "@/components/InsightMarkdown";
import { presentInsight } from "@/lib/reword-small-business";
import { getCanonicalSlug, getOldSlug } from "@/lib/insight-slug-aliases";
import { getInsightStrategyCallCopy } from "@/lib/get-insight-strategy-call";
import { presentInsightArticleBody } from "@/lib/insight-strategy-call";
import type { Metadata } from "next";
import { pageSocialMetadata } from "@/lib/seo-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = getCanonicalSlug(slug);

  // Try new slug first, fall back to old slug if it exists
  let post = await prisma.insightPost.findUnique({
    where: {
      slug,
      status: "published",
      publishedAt: {
        not: null,
      },
    },
  });

  // Fallback: if new slug not found in DB, try old slug
  if (!post) {
    const oldSlug = getOldSlug(slug);
    if (oldSlug) {
      post = await prisma.insightPost.findUnique({
        where: {
          slug: oldSlug,
          status: "published",
          publishedAt: {
            not: null,
          },
        },
      });
    }
  }

  if (!post) {
    return {};
  }

  const article = presentInsight(post);
  const canonical = `https://cerpamedia.com/insights/${canonicalSlug}`;

  return pageSocialMetadata({
    title: article.title,
    description: article.summary,
    path: `/insights/${canonicalSlug}`,
    imagePath: `/insights/${canonicalSlug}/opengraph-image`,
    imageAlt: article.title,
    type: "article",
    publishedTime: article.publishedAt?.toISOString(),
    canonical,
  });
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try new slug first, fall back to old slug if it exists
  let post = await prisma.insightPost.findUnique({
    where: {
      slug,
      status: "published",
      publishedAt: {
        not: null,
      },
    },
  });

  // Fallback: if new slug not found in DB, try old slug
  if (!post) {
    const oldSlug = getOldSlug(slug);
    if (oldSlug) {
      post = await prisma.insightPost.findUnique({
        where: {
          slug: oldSlug,
          status: "published",
          publishedAt: {
            not: null,
          },
        },
      });
    }
  }

  if (!post) {
    notFound();
  }

  const article = presentInsight(post);
  const canonicalSlug = getCanonicalSlug(slug);
  const strategyCallCopy = await getInsightStrategyCallCopy();
  const articleBody = presentInsightArticleBody(article.body);

  return (
    <div className="bg-bg">
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl xl:mx-auto">
              <div className="mb-6">
                <Link
                  href="/insights"
                  className="inline-flex items-center text-sm text-text-muted hover:text-text transition-colors"
                >
                  ← Back to Insights
                </Link>
              </div>
              <div>
                {article.publishedAt && (
                  <time className="text-sm text-text-muted block mb-3">
                    {format(new Date(article.publishedAt), "MMMM d, yyyy")}
                  </time>
                )}
                <h1 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight leading-tight">
                  {article.title}
                </h1>
                <p className="text-lg text-text-muted leading-relaxed">
                  {article.summary}
                </p>
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-xs px-2 py-1 border border-border text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <article className="prose prose-slate max-w-none">
              <InsightMarkdown>{articleBody}</InsightMarkdown>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl xl:mx-auto">
            <InsightStrategyCallBox copy={strategyCallCopy} />
          </div>
        </div>
      </section>
      <InsightReadTracker slug={canonicalSlug} />
    </div>
  );
}
