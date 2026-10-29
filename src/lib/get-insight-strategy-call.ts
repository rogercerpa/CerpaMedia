import { prisma } from "./prisma";
import {
  DEFAULT_INSIGHT_STRATEGY_CALL,
  INSIGHT_STRATEGY_CALL_KEY,
  sanitizeInsightStrategyCallCopy,
  type InsightStrategyCallCopy,
} from "./insight-strategy-call";

export async function getInsightStrategyCallCopy(): Promise<InsightStrategyCallCopy> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: INSIGHT_STRATEGY_CALL_KEY },
    });
    if (!content) return DEFAULT_INSIGHT_STRATEGY_CALL;
    return sanitizeInsightStrategyCallCopy(content.value);
  } catch (error) {
    console.error("Failed to fetch insight strategy call copy:", error);
    return DEFAULT_INSIGHT_STRATEGY_CALL;
  }
}
