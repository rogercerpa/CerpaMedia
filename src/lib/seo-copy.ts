import type { Metadata } from "next";

export interface SeoMetaData {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

/** Titles previously shared by /, /services, /consult, /insights, and /contact. */
export const SHARED_SEO_TITLES = [
  "CerpaMedia - Technology Services for Business Owners",
  "CerpaMedia - Technology Services for Small Business",
] as const;

/** Descriptions previously shared by those same five routes. */
export const SHARED_SEO_DESCRIPTIONS = [
  "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
] as const;

export const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "CerpaMedia — Technology for Business Owners",
    description:
      "Practical web apps, AI, and automation for business owners. A clear plan first, and systems you own.",
  },
  "/services": {
    title: "Services — CerpaMedia",
    description:
      "Web apps, practical AI, and automation for owner-led businesses. Paid discovery first, fixed scope when you build, and you keep ownership.",
  },
  "/consult": {
    title: "Technology Strategy Call — CerpaMedia",
    description:
      "Book a 30–45 minute call with Roger. $99, then a written summary with 3–5 opportunities and one next step.",
  },
  "/insights": {
    title: "Insights — CerpaMedia",
    description:
      "AI and technology notes for business owners, with a practical use for the tools you already run.",
  },
  "/contact": {
    title: "Contact — CerpaMedia",
    description: "Write to CerpaMedia about a project, a question, or booking a call.",
  },
  "/services/ai-teammate-launch": {
    title: "AI Teammate Launch - CerpaMedia",
    description:
      "Your first two AI employees working in 14 days. Founding and regular rates are on this page. You own the accounts.",
  },
  "/privacy": {
    title: "Privacy Policy - CerpaMedia",
    description: "CerpaMedia Privacy Policy - How we collect, use, and protect your personal information.",
  },
  "/terms": {
    title: "Terms of Service - CerpaMedia",
    description:
      "CerpaMedia Terms of Service - Your agreement for using our Site and booking the Technology Strategy Call.",
  },
  "/strategy-call-policy": {
    title: "Strategy Call Policy - CerpaMedia",
    description: "Technology Strategy Call refund, cancellation, reschedule and no-show policy.",
  },
  "/consult/success": {
    title: "Strategy Call Booked — CerpaMedia",
    description: "Your Technology Strategy Call payment went through. Roger will contact you to schedule.",
  },
  "/consult/cancel": {
    title: "Strategy Call Not Completed — CerpaMedia",
    description: "The Technology Strategy Call booking was not completed. No payment was processed.",
  },
};

const META_DESCRIPTION_MAX = 160;

export function conciseText(value: string, max = META_DESCRIPTION_MAX): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const space = slice.lastIndexOf(" ");
  const base = (space >= Math.floor(max * 0.6) ? slice.slice(0, space) : slice).replace(
    /[\s,;:.–—-]+$/u,
    ""
  );
  return `${base}…`;
}

export function isSharedSeoTitle(value: string | null | undefined): boolean {
  if (!value) return false;
  return (SHARED_SEO_TITLES as readonly string[]).includes(value.trim());
}

export function isSharedSeoDescription(value: string | null | undefined): boolean {
  if (!value) return false;
  return (SHARED_SEO_DESCRIPTIONS as readonly string[]).includes(value.trim());
}

/**
 * Stored CMS copy wins when it is actually unique.
 * The old shared title and description are treated as unset so each route
 * can have its own metadata without a database write.
 */
export function resolveRouteSeo(path: string, stored: SeoMetaData = {}): SeoMetaData {
  const defaults = ROUTE_SEO[path];
  const title =
    stored.title && !isSharedSeoTitle(stored.title) ? stored.title : defaults?.title ?? stored.title;
  const description =
    stored.description && !isSharedSeoDescription(stored.description)
      ? stored.description
      : defaults?.description ?? stored.description;
  return {
    title,
    description,
    ogImageUrl: stored.ogImageUrl,
  };
}

export function publicSeoForPath(path: string, stored: SeoMetaData = {}): SeoMetaData {
  const resolved = resolveRouteSeo(path, stored);
  return {
    ...resolved,
    description: resolved.description ? conciseText(resolved.description) : resolved.description,
  };
}

const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "CerpaMedia — technology for business owners",
};

export function pageSocialMetadata(input: {
  title: string;
  description: string;
  path?: string;
  ogImageUrl?: string;
  imagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  canonical?: string;
}): Metadata {
  const description = conciseText(input.description);
  const images = input.ogImageUrl
    ? [input.ogImageUrl]
    : [
        input.imagePath
          ? {
              url: input.imagePath,
              width: 1200,
              height: 630,
              alt: input.imageAlt ?? "CerpaMedia",
            }
          : DEFAULT_SHARE_IMAGE,
      ];
  return {
    title: { absolute: input.title },
    description,
    ...(input.canonical ? { alternates: { canonical: input.canonical } } : {}),
    openGraph: {
      title: input.title,
      description,
      type: input.type ?? "website",
      siteName: "CerpaMedia",
      ...(input.path ? { url: input.path } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images,
    },
  };
}
