export type PublicDemoMode = "samples" | "replay";

export type ReplayScript = {
  inputLabel: string;
  outputLabel: string;
  before: string;
  after: string;
  durationMs: number;
};

export type DemoGateInput = {
  killSwitch: boolean;
  spendUsd: number;
  capUsd: number;
  isAdmin: boolean;
};

export function visitorCanTriggerAi(): boolean {
  return false;
}

export function canServePublicDemo(args: {
  enabled: boolean;
  status: string;
  demosPublicEnabled: boolean;
}): boolean {
  return (
    args.enabled === true &&
    args.status === "published" &&
    args.demosPublicEnabled === true
  );
}

export function isCapHit(spendUsd: number, capUsd: number): boolean {
  return spendUsd >= capUsd;
}

export function publicDemoMode(args: {
  killSwitch: boolean;
  spendUsd: number;
  capUsd: number;
}): PublicDemoMode {
  if (args.killSwitch) return "replay";
  if (isCapHit(args.spendUsd, args.capUsd)) return "replay";
  return "samples";
}

export function canGenerate(
  args: DemoGateInput
): { ok: true } | { ok: false; error: string; status: number } {
  if (!args.isAdmin || visitorCanTriggerAi()) {
    if (!args.isAdmin) {
      return {
        ok: false,
        error: "Visitors cannot trigger AI generation.",
        status: 403,
      };
    }
  }

  if (!args.isAdmin) {
    return {
      ok: false,
      error: "Visitors cannot trigger AI generation.",
      status: 403,
    };
  }

  if (args.killSwitch) {
    return {
      ok: false,
      error: "Demo kill switch is on. Generation is disabled.",
      status: 423,
    };
  }

  if (isCapHit(args.spendUsd, args.capUsd)) {
    return {
      ok: false,
      error: "Daily spend cap reached. Generation is disabled; public demos fall back to replays.",
      status: 429,
    };
  }

  return { ok: true };
}

export function estimateGenerationCostUsd(args: {
  inputTokens?: number;
  outputTokens?: number;
}): number {
  const inputRate = Number(process.env.AI_GATEWAY_INPUT_USD_PER_MTOK || "0.15");
  const outputRate = Number(
    process.env.AI_GATEWAY_OUTPUT_USD_PER_MTOK || "0.60"
  );
  const inputTokens = args.inputTokens ?? 0;
  const outputTokens = args.outputTokens ?? 0;
  const fromTokens =
    (inputTokens / 1_000_000) * inputRate +
    (outputTokens / 1_000_000) * outputRate;
  const floor = Number(process.env.AI_GATEWAY_MIN_COST_USD || "0.002");
  return Math.max(fromTokens, floor);
}

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export const ANALYTICS_EVENTS = [
  "guide_read",
  "demo_run",
  "email_click",
  "cta_99_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEventName(
  value: string
): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}
