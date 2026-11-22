import type { NextConfig } from "next";
import { INSIGHT_SLUG_ALIASES } from "./src/lib/insight-slug-aliases";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders(),
      },
      {
        source: "/launch/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  async redirects() {
    // Generate insight slug redirects from the shared alias map
    const insightRedirects = Object.entries(INSIGHT_SLUG_ALIASES).map(
      ([oldSlug, newSlug]) => ({
        source: `/insights/${oldSlug}`,
        destination: `/insights/${newSlug}`,
        permanent: true,
      })
    );

    return [
      {
        source: "/ai-teammate-launch",
        destination: "/services/ai-teammate-launch",
        permanent: true,
      },
      ...insightRedirects,
    ];
  },
};

export default nextConfig;
