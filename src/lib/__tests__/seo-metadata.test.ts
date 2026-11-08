import { describe, expect, it } from "vitest";
import {
  ROUTE_SEO,
  SHARED_SEO_DESCRIPTIONS,
  SHARED_SEO_TITLES,
  conciseText,
  pageSocialMetadata,
  publicSeoForPath,
} from "../seo-copy";

const PRICE_FREE_PATHS = ["/", "/services", "/insights", "/contact"] as const;

describe("public route metadata", () => {
  it("gives the shared routes distinct titles and descriptions", () => {
    const paths = ["/", "/services", "/consult", "/insights", "/contact"] as const;
    const titles = paths.map((path) => publicSeoForPath(path).title);
    const descriptions = paths.map((path) => publicSeoForPath(path).description);
    expect(new Set(titles).size).toBe(paths.length);
    expect(new Set(descriptions).size).toBe(paths.length);
    for (const title of titles) expect(title!.length).toBeLessThanOrEqual(70);
    for (const description of descriptions) {
      expect(description!.length).toBeGreaterThan(40);
      expect(description!.length).toBeLessThanOrEqual(160);
    }
  });

  it("replaces the old shared title and description without dropping a custom CMS value", () => {
    const home = publicSeoForPath("/", {
      title: SHARED_SEO_TITLES[0],
      description: SHARED_SEO_DESCRIPTIONS[0],
    });
    expect(home.title).toBe(ROUTE_SEO["/"].title);
    expect(home.description).toBe(ROUTE_SEO["/"].description);

    const legacy = publicSeoForPath("/services", {
      title: SHARED_SEO_TITLES[1],
      description: SHARED_SEO_DESCRIPTIONS[1],
    });
    expect(legacy.title).toBe(ROUTE_SEO["/services"].title);
    expect(legacy.description).not.toMatch(/small business/i);

    const custom = publicSeoForPath("/contact", {
      title: "Custom contact title",
      description: "A custom contact description that is specific to this page.",
    });
    expect(custom.title).toBe("Custom contact title");
    expect(custom.description).toBe("A custom contact description that is specific to this page.");
  });

  it("keeps prices off the home, services, insights, and contact metadata", () => {
    for (const path of PRICE_FREE_PATHS) {
      const seo = publicSeoForPath(path, {
        title: SHARED_SEO_TITLES[0],
        description: SHARED_SEO_DESCRIPTIONS[0],
      });
      expect(`${seo.title} ${seo.description}`).not.toMatch(/\$\d|\bSMB\b|small business/i);
    }
  });

  it("leaves the strategy call price on the consult page only among those five", () => {
    expect(publicSeoForPath("/consult").description).toMatch(/\$99/);
    expect(publicSeoForPath("/consult").description).not.toMatch(/small business|\bSMB\b/i);
  });

  it("shortens long article excerpts on a word boundary", () => {
    const summary =
      "Google is sending fewer clicks from ordinary search results when an AI answer sits on top. Check Search Console for the queries that still bring visitors, then decide which pages need a clearer answer of their own before the summary replaces the click.";
    const short = conciseText(summary, 160);
    expect(short.length).toBeLessThanOrEqual(160);
    expect(short.endsWith("…")).toBe(true);
    expect(short.endsWith(" …")).toBe(false);
    expect(summary.startsWith(short.slice(0, -1))).toBe(true);
  });

  it("sets a large Twitter card and a default 1200 by 630 share image", () => {
    const metadata = pageSocialMetadata({
      title: "Services — CerpaMedia",
      description: ROUTE_SEO["/services"].description,
      path: "/services",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.openGraph).toMatchObject({
      siteName: "CerpaMedia",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
        },
      ],
    });
  });
});
