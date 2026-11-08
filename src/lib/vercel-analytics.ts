import { isAdminPath } from "./analytics-events";

type VercelAnalyticsEvent = { url: string };

/**
 * Vercel Web Analytics records the page URL. Drop admin screens and the
 * token-gated launch setup link so those URLs are not sent.
 * First-party daily counts already skip admin traffic on their own.
 */
export function shouldSendVercelPageview(url: string): boolean {
  let path = "";
  try {
    path = new URL(url, "https://cerpamedia.com").pathname;
  } catch {
    return false;
  }
  if (isAdminPath(path)) return false;
  if (path === "/launch" || path.startsWith("/launch/")) return false;
  return true;
}

export function vercelAnalyticsBeforeSend<T extends VercelAnalyticsEvent>(event: T): T | null {
  if (!event?.url || !shouldSendVercelPageview(event.url)) return null;
  return event;
}
