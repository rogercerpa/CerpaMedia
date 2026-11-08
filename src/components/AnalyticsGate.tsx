import { isAnalyticsEnabled } from "@/lib/flags";
import VercelAnalytics from "@/components/VercelAnalytics";

export default async function AnalyticsGate() {
  try {
    const enabled = await isAnalyticsEnabled();
    if (!enabled) {
      return null;
    }
    return <VercelAnalytics />;
  } catch {
    return null;
  }
}
