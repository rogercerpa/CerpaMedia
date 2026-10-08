import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ai-teammate-launch",
        destination: "/services/ai-teammate-launch",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
