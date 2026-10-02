import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.insightPost.findUnique({
    where: {
      slug,
      status: "published",
      publishedAt: {
        not: null,
      },
    },
  });

  if (!post) {
    notFound();
  }

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
              {post.publishedAt && (
                <time className="text-sm text-text-muted block mb-3">
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </time>
              )}
              <h1 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-text-muted leading-relaxed">
                {post.summary}
              </p>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
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
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-text underline hover:text-text-muted transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
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
                {post.body}
              </ReactMarkdown>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border bg-bg-subtle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-text mb-4">
                Need help with technology strategy?
              </h2>
              <p className="text-[15px] text-text-muted mb-6 leading-relaxed">
                Book a consultation to discuss how we can help your business leverage technology and AI
              </p>
              <Link
                href="/consult"
                className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Book $99 call
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
