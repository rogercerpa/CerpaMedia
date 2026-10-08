import { prisma } from "./prisma";
import type { Metadata } from "next";

export interface SeoMetaData {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

export const defaultSeoMeta: Record<string, SeoMetaData> = {
  "/": {
    title: "CerpaMedia - Web Apps, AI & Automation for Small Businesses",
    description: "Stop losing hours to tools that don't talk to each other. CerpaMedia helps small businesses get practical web apps, AI, and automation with a clear plan first.",
  },
  "/services": {
    title: "Services - CerpaMedia",
    description: "Web development, AI integration, automation consulting, and more. Practical technology solutions for small businesses.",
  },
  "/consult": {
    title: "Book $99 Technology Strategy Call - CerpaMedia",
    description: "30-45 minute call with Roger. Get 3-5 opportunities and a written summary within 24-48 hours.",
  },
  "/ai-teammate-launch": {
    title: "AI Teammate Launch - CerpaMedia",
    description: "Your first two AI employees working in 14 days. $799 founding rate for the first 5 clients. We set up the teammates, you own the accounts.",
  },
  "/insights": {
    title: "Insights - AI & Tech for Small Businesses - CerpaMedia",
    description: "Practical insights on AI, automation, and technology for small businesses. Real-world guidance without the hype.",
  },
  "/contact": {
    title: "Contact - CerpaMedia",
    description: "Get in touch with CerpaMedia. Email cerpamedia@gmail.com or call (943) 248-7410.",
  },
  "/privacy": {
    title: "Privacy Policy - CerpaMedia",
    description: "Privacy policy for CerpaMedia services.",
  },
  "/terms": {
    title: "Terms of Service - CerpaMedia",
    description: "Terms of service for CerpaMedia services.",
  },
  "/strategy-call-policy": {
    title: "Strategy Call Policy - CerpaMedia",
    description: "Policy and terms for the $99 Technology Strategy Call.",
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

    if (!meta || (!meta.title && !meta.description && !meta.ogImageUrl)) {
      return defaultSeoMeta[path] || {};
    }

    return {
      title: meta.title || defaultSeoMeta[path]?.title,
      description: meta.description || defaultSeoMeta[path]?.description,
      ogImageUrl: meta.ogImageUrl || undefined,
    };
  } catch (error) {
    console.error(`Failed to fetch SEO meta for ${path}:`, error);
    return defaultSeoMeta[path] || {};
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
