import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
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
    return [
      {
        source: "/ai-teammate-launch",
        destination: "/services/ai-teammate-launch",
        permanent: true,
      },
      {
        source: "/insights/openai-gpt-4o-gpt-4-1-api-shutdown-small-business",
        destination: "/insights/openai-gpt-4o-gpt-4-1-api-shutdown",
        permanent: true,
      },
      {
        source: "/insights/small-business-ai-adoption-october-2026",
        destination: "/insights/business-ai-adoption-october-2026",
        permanent: true,
      },
      {
        source: "/insights/dots-vs-grok-bot-vs-muse-smb-ai-teammate",
        destination: "/insights/dots-vs-grok-bot-vs-muse-ai-teammate",
        permanent: true,
      },
      {
        source: "/insights/openai-smb-agentic-shift-sbdc-report",
        destination: "/insights/openai-agentic-shift-sbdc-report",
        permanent: true,
      },
      {
        source: "/insights/openai-dots-always-on-agents-smb",
        destination: "/insights/openai-dots-always-on-agents",
        permanent: true,
      },
      {
        source: "/insights/meta-muse-small-business-tools",
        destination: "/insights/meta-muse-business-tools",
        permanent: true,
      },
      {
        source: "/insights/grok-team-bots-shared-ai-coworkers-smb",
        destination: "/insights/grok-team-bots-shared-ai-coworkers",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
