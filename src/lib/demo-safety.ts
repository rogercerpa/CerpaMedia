export type PublicDemoMode = "samples" | "replay";

export type ReplayScript = {
  inputLabel: string;
  outputLabel: string;
  before: string;
  after: string;
  durationMs: number;
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

export function publicDemoMode(args: { killSwitch: boolean }): PublicDemoMode {
  return args.killSwitch ? "replay" : "samples";
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
