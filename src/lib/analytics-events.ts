import { getCanonicalSlug } from "./insight-slug-aliases";
import { ANALYTICS_EVENTS, isAnalyticsEventName } from "./demo-safety";

export const INSIGHT_READ_PREFIX = "insight_read:";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Daily count key for one Insights article.
 * Old public slugs collapse onto the canonical slug.
 */
export function insightReadEventName(slug: string): string | null {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed || trimmed.length > 160) return null;
  const canonical = getCanonicalSlug(trimmed);
  if (!SLUG_PATTERN.test(canonical) || canonical.length > 120) return null;
  return `${INSIGHT_READ_PREFIX}${canonical}`;
}

export function isStoredAnalyticsEvent(value: string): boolean {
  if (isAnalyticsEventName(value)) return true;
  if (!value.startsWith(INSIGHT_READ_PREFIX)) return false;
  const slug = value.slice(INSIGHT_READ_PREFIX.length);
  return insightReadEventName(slug) === value;
}

/** Events a browser may post. Contact submissions are recorded only by the server action. */
export function resolveClientAnalyticsEvent(body: {
  event?: unknown;
  slug?: unknown;
}): string | null {
  const event = typeof body.event === "string" ? body.event : "";
  if (event === "contact_submit") return null;
  if (event === "insight_read") {
    return typeof body.slug === "string" ? insightReadEventName(body.slug) : null;
  }
  if (event.startsWith(INSIGHT_READ_PREFIX)) {
    return insightReadEventName(event.slice(INSIGHT_READ_PREFIX.length));
  }
  if ((ANALYTICS_EVENTS as readonly string[]).includes(event) && event !== "contact_submit") {
    return event;
  }
  return null;
}

export type TrackContext = {
  userAgent?: string | null;
  path?: string | null;
  referer?: string | null;
  nextUrl?: string | null;
  prefetch?: boolean;
};

const BOT_TOKENS = [
  "googlebot",
  "adsbot-google",
  "mediapartners-google",
  "bingbot",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "slurp",
  "spider",
  "crawler",
  "applebot",
  "facebookexternalhit",
  "embedly",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "linkedinbot",
  "twitterbot",
  "pinterestbot",
  "redditbot",
  "gptbot",
  "chatgpt-user",
  "claudebot",
  "anthropic-ai",
  "amazonbot",
  "bytespider",
  "petalbot",
  "ahrefs",
  "semrush",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "screaming frog",
  "lighthouse",
  "pagespeed",
  "headlesschrome",
  "phantomjs",
  "python-requests",
  "go-http-client",
  "curl/",
  "wget/",
  "scrapy",
  "uptimerobot",
  "pingdom",
  "statuscake",
  "vercel-screenshot",
  "ia_archiver",
];

export function isAdminPath(path: string | null | undefined): boolean {
  if (!path) return false;
  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function pathnameFromUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).pathname;
  } catch {
    return null;
  }
}

export function safeAnalyticsPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  if (value.length > 300) return null;
  return value.split("?")[0]?.split("#")[0] ?? null;
}

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.trim().toLowerCase();
  if (ua.length < 12) return true;
  return BOT_TOKENS.some((token) => ua.includes(token));
}

export function shouldSkipAnalytics(context: TrackContext): boolean {
  if (context.prefetch) return true;
  if (isLikelyBot(context.userAgent)) return true;
  if (isAdminPath(context.path) || isAdminPath(context.nextUrl)) return true;
  if (isAdminPath(pathnameFromUrl(context.referer))) return true;
  return false;
}

type HeaderSource = { get(name: string): string | null };

export function trackContextFromHeaders(headers: HeaderSource, path?: string | null): TrackContext {
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`.toLowerCase();
  const prefetchHeader = headers.get("next-router-prefetch") ?? headers.get("x-middleware-prefetch");
  return {
    userAgent: headers.get("user-agent"),
    path: path ?? headers.get("next-url") ?? headers.get("x-invoke-path"),
    referer: headers.get("referer"),
    nextUrl: headers.get("next-url"),
    prefetch: purpose.includes("prefetch") || prefetchHeader === "1",
  };
}
