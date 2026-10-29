"use client";

import { isAdminPath, pathnameFromUrl } from "@/lib/analytics-events";

type ClientEvent =
  | { event: "cta_99_click" }
  | { event: "insight_read"; slug: string }
  | { event: "guide_read" | "demo_run" | "email_click" };

const recentInsightReads = new Map<string, number>();

function currentPageIsAdmin(): boolean {
  if (typeof window === "undefined") return false;
  if (isAdminPath(window.location.pathname)) return true;
  return isAdminPath(pathnameFromUrl(document.referrer));
}

export function postClientEvent(body: ClientEvent): void {
  if (typeof window === "undefined") return;
  if (currentPageIsAdmin()) return;
  if (body.event === "insight_read") {
    const now = Date.now();
    const previous = recentInsightReads.get(body.slug) ?? 0;
    if (now - previous < 2000) return;
    recentInsightReads.set(body.slug, now);
  }

  const payload = JSON.stringify({
    ...body,
    path: window.location.pathname,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/api/analytics/event",
        new Blob([payload], { type: "application/json" })
      );
      if (sent) return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function trackStrategyCallClick(): void {
  postClientEvent({ event: "cta_99_click" });
}
