import { Analytics } from "@vercel/analytics/react";
import { isAnalyticsEnabled } from "@/lib/flags";

export default async function AnalyticsGate() {
  try {
    const enabled = await isAnalyticsEnabled();
    if (!enabled) {
      return null;
    }
    return <Analytics />;
  } catch {
    return null;
  }
}
