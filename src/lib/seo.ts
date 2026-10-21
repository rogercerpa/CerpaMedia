import { prisma } from "./prisma";
import type { Metadata } from "next";
import { fallbackLaunchOffer, launchMetaDescription } from "./launch-offer";
import { presentSeoText, SEO_DESCRIPTION, SEO_TITLE } from "./reword-small-business";

export interface SeoMetaData {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

export const defaultSeoMeta: Record<string, SeoMetaData> = {
  "/": {
    title: "CerpaMedia - Technology Services for Business Owners",
    description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  },
  "/services": {
    title: "CerpaMedia - Technology Services for Business Owners",
    description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  },
  "/consult": {
    title: "CerpaMedia - Technology Services for Business Owners",
    description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  },
  "/services/ai-teammate-launch": {
    title: "AI Teammate Launch - CerpaMedia",
    description: launchMetaDescription(fallbackLaunchOffer()),
  },
  "/insights": {
    title: "CerpaMedia - Technology Services for Business Owners",
    description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  },
  "/contact": {
    title: "CerpaMedia - Technology Services for Business Owners",
    description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
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
      title: meta.title ? presentSeoText(meta.title, SEO_TITLE) : undefined,
      description: meta.description ? presentSeoText(meta.description, SEO_DESCRIPTION) : undefined,
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
