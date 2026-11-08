"use client";

import { Analytics } from "@vercel/analytics/next";
import { vercelAnalyticsBeforeSend } from "@/lib/vercel-analytics";

export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => vercelAnalyticsBeforeSend(event)} />;
}
