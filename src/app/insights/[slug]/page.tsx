import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { InsightReadTracker } from "@/components/InsightReadTracker";
import { InsightStrategyCallBox } from "@/components/InsightStrategyCallBox";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { presentInsight } from "@/lib/reword-small-business";
import { getCanonicalSlug, getOldSlug } from "@/lib/insight-slug-aliases";
import { getInsightStrategyCallCopy } from "@/lib/get-insight-strategy-call";
import {
  consultPath,
  isInBodyStrategyCallLink,
  presentInsightArticleBody,
  reactNodeText,
  STRATEGY_CALL_BUTTON_LABEL,
} from "@/lib/insight-strategy-call";
import { StrategyCallLink } from "@/components/StrategyCallLink";
import type { Metadata } from "next";

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

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `https://cerpamedia.com/insights/${canonicalSlug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://cerpamedia.com/insights/${canonicalSlug}`,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-semibold text-text mb-4 mt-8 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-text mb-3 mt-8 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-text mb-2 mt-6 first:mt-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[15px] text-text-muted leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-[15px] text-text-muted">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-[15px] text-text-muted">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] text-text-muted leading-relaxed">
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => {
                    if (consultPath(href)) {
                      return (
                        <StrategyCallLink
                          href="/consult"
                          className="text-text underline hover:text-text-muted transition-colors"
                        >
                          {isInBodyStrategyCallLink(href, reactNodeText(children))
                            ? STRATEGY_CALL_BUTTON_LABEL
                            : children}
                        </StrategyCallLink>
                      );
                    }
                    return (
                      <a
                        href={href}
                        className="text-text underline hover:text-text-muted transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 italic text-text-muted my-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-bg-subtle px-1.5 py-0.5 text-sm text-text font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-bg-subtle p-4 overflow-x-auto mb-4 text-sm">
                      {children}
                    </pre>
                  ),
                }}
              >
                {articleBody}
              </ReactMarkdown>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <InsightStrategyCallBox copy={strategyCallCopy} />
        </div>
      </section>
      <InsightReadTracker slug={canonicalSlug} />
    </div>
  );
}
