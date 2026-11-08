/**
 * Absolute origin for metadata. Production stays on the public site.
 * Preview and local builds point at the host that is actually serving the page,
 * so Open Graph image URLs can be fetched from that deployment.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return "https://cerpamedia.com";
  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
