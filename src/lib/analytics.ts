import { prisma } from "./prisma";
import { utcDateKey } from "./demo-safety";
import {
  isStoredAnalyticsEvent,
  shouldSkipAnalytics,
  type TrackContext,
} from "./analytics-events";
import { isAnalyticsEnabled } from "./flags";

export async function recordTrackedEvent(
  eventName: string,
  context: TrackContext = {}
): Promise<{ ok: true; skipped?: boolean } | { ok: false; error: string; status: number }> {
  if (!isStoredAnalyticsEvent(eventName)) {
    return { ok: false, error: "Unknown event.", status: 400 };
  }

  if (shouldSkipAnalytics(context)) {
    return { ok: true, skipped: true };
  }

  let enabled = false;
  try {
    enabled = await isAnalyticsEnabled();
  } catch (error) {
    console.error("Failed to read analytics flag:", error);
    enabled = false;
  }
  if (!enabled) {
    return { ok: true, skipped: true };
  }

  try {
    const date = utcDateKey();
    await prisma.analyticsDailyCount.upsert({
      where: {
        date_eventName: { date, eventName },
      },
      create: { date, eventName, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to record analytics event:", error);
    return { ok: false, error: "Could not record event.", status: 500 };
  }

  return { ok: true };
}

export async function incrementAnalyticsEvent(
  eventName: string,
  context?: TrackContext
): Promise<{ ok: true; skipped?: boolean } | { ok: false; error: string; status: number }> {
  return recordTrackedEvent(eventName, context);
}
