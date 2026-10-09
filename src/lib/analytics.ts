import { prisma } from "./prisma";
import {
  isAnalyticsEventName,
  utcDateKey,
  type AnalyticsEventName,
} from "./demo-safety";
import { isAnalyticsEnabled } from "./flags";

export async function incrementAnalyticsEvent(
  eventName: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!isAnalyticsEventName(eventName)) {
    return { ok: false, error: "Unknown event.", status: 400 };
  }

  const date = utcDateKey();
  await prisma.analyticsDailyCount.upsert({
    where: {
      date_eventName: { date, eventName },
    },
    create: { date, eventName, count: 1 },
    update: { count: { increment: 1 } },
  });

  return { ok: true };
}

export async function shouldEmitClientAnalytics(): Promise<boolean> {
  return isAnalyticsEnabled();
}

export const CLIENT_EVENT_NAMES: AnalyticsEventName[] = [
  "guide_read",
  "demo_run",
  "email_click",
  "cta_99_click",
];
