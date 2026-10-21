import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/try", "/launch"],
      },
    ],
    sitemap: "https://cerpamedia.com/sitemap.xml",
  };
}
