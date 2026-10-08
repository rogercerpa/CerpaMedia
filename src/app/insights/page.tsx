import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { format } from "date-fns";
import { getSeoMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("/insights");
  
  // Only override if there's a DB value, otherwise use layout default
  if (!seo.title && !seo.description) {
    return {};
  }
  
  const metadata: Metadata = {};
  if (seo.title) metadata.title = seo.title;
  if (seo.description) metadata.description = seo.description;
  if (seo.ogImageUrl) {
    metadata.openGraph = { images: [seo.ogImageUrl] };
  }
  
  return metadata;
}

export default async function InsightsPage() {
  const posts = await prisma.insightPost.findMany({
    where: {
      status: "published",
      publishedAt: {
        not: null,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      tags: true,
      publishedAt: true,
    },
  });

  return (
    <div className="bg-bg">
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 text-text tracking-tight">
                Insights
              </h1>
              <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
                AI and technology news with practical business applications for SMBs
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <Reveal>
              <div className="text-center text-text-muted py-12">
                <p className="text-lg">No insights published yet. Check back soon!</p>
              </div>
            </Reveal>
          ) : (
            <Reveal stagger staggerDelay={80}>
              <div className="space-y-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="border border-border p-6 md:p-8 hover:border-text-muted transition-all duration-300"
                  >
                    <div className="mb-3">
                      {post.publishedAt && (
                        <time className="text-sm text-text-muted">
                          {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                        </time>
                      )}
                    </div>
                    <Link href={`/insights/${post.slug}`}>
                      <h2 className="text-2xl font-semibold text-text mb-3 hover:text-text-muted transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-[15px] text-text-muted leading-relaxed mb-4">
                      {post.summary}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
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
                    <Link
                      href={`/insights/${post.slug}`}
                      className="inline-block text-[15px] text-text hover:text-text-muted transition-colors font-medium"
                    >
                      Read more →
                    </Link>
                  </article>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}
