import { prisma } from "./prisma";
import type { Metadata } from "next";
import { presentSeoText, SEO_DESCRIPTION, SEO_TITLE } from "./reword-small-business";
import {
  pageSocialMetadata,
  publicSeoForPath,
  ROUTE_SEO,
  type SeoMetaData,
} from "./seo-copy";

export type { SeoMetaData } from "./seo-copy";

export const defaultSeoMeta: Record<string, SeoMetaData> = Object.fromEntries(
  Object.entries(ROUTE_SEO).map(([path, seo]) => [
    path,
    { title: seo.title, description: seo.description },
  ])
);

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

export async function publicPageMetadata(path: string, extra?: Metadata): Promise<Metadata> {
  const stored = await getSeoMeta(path);
  const seo = publicSeoForPath(path, stored);
  return {
    ...pageSocialMetadata({
      title: seo.title || ROUTE_SEO[path]?.title || "CerpaMedia",
      description: seo.description || ROUTE_SEO[path]?.description || "",
      path,
      ogImageUrl: seo.ogImageUrl,
    }),
    ...extra,
  };
}
