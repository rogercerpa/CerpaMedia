import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/try"],
      },
    ],
    sitemap: "https://cerpamedia.com/sitemap.xml",
  };
}
