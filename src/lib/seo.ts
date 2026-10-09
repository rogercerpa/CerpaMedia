import { prisma } from "./prisma";
import type { Metadata } from "next";

export interface SeoMetaData {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

export const defaultSeoMeta: Record<string, SeoMetaData> = {
  "/": {
    title: "CerpaMedia - Technology Services for Small Business",
    description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  },
  "/services": {
    title: "CerpaMedia - Technology Services for Small Business",
    description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  },
  "/consult": {
    title: "CerpaMedia - Technology Services for Small Business",
    description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  },
  "/services/ai-teammate-launch": {
    title: "AI Teammate Launch - CerpaMedia",
    description: "Your first two AI employees working in 14 days. $799 founding rate for the first 5 clients. We set up Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork — you own the accounts.",
  },
  "/insights": {
    title: "CerpaMedia - Technology Services for Small Business",
    description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  },
  "/contact": {
    title: "CerpaMedia - Technology Services for Small Business",
    description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  },
  "/privacy": {
    title: "Privacy Policy - CerpaMedia",
    description: "CerpaMedia Privacy Policy - How we collect, use, and protect your personal information.",
  },
  "/terms": {
    title: "Terms of Service - CerpaMedia",
    description: "CerpaMedia Terms of Service - Your agreement for using our Site and booking the Technology Strategy Call.",
  },
  "/strategy-call-policy": {
    title: "Strategy Call Policy - CerpaMedia",
    description: "Technology Strategy Call refund, cancellation, reschedule and no-show policy.",
  },
};

export async function getSeoMeta(path: string): Promise<SeoMetaData> {
  try {
    const meta = await prisma.seoMeta.findUnique({
      where: { path },
      select: {
        title: true,
        description: true,
        ogImageUrl: true,
      },
    });

    // Only return metadata if there's a DB entry with actual values
    if (!meta || (!meta.title && !meta.description && !meta.ogImageUrl)) {
      return {};
    }

    return {
      title: meta.title || undefined,
      description: meta.description || undefined,
      ogImageUrl: meta.ogImageUrl || undefined,
    };
  } catch (error) {
    console.error(`Failed to fetch SEO meta for ${path}:`, error);
    return {};
  }
}

export async function buildMetadata(path: string, overrides?: Metadata): Promise<Metadata> {
  const seo = await getSeoMeta(path);

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    ...overrides,
  };

  if (seo.ogImageUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [seo.ogImageUrl],
    };
  }

  return metadata;
}
