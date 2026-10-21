export const LAUNCH_OFFER = "ai-teammate-launch";

export const LAUNCH_SETUP_SERVICE = "launch_setup";
export const LAUNCH_SETUP_LABEL = "AI Teammate Launch — setup session";
export const DEFAULT_LAUNCH_SETUP_LENGTH_MIN = 90;

export const LAUNCH_SETUP_PLATFORMS = [
  "Zoom",
  "Microsoft Teams",
  "In person (Woodstock, GA area)",
] as const;

export type LaunchSetupPlatform = (typeof LAUNCH_SETUP_PLATFORMS)[number];

export type BookingKind = "strategy_call" | "launch_setup";

export function isLaunchSetupPlatform(value: string): value is LaunchSetupPlatform {
  return (LAUNCH_SETUP_PLATFORMS as readonly string[]).includes(value);
}

export function isPlausibleBookingToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token);
}

export function launchSetupPath(token: string): string {
  return `/launch/setup/${encodeURIComponent(token)}`;
}

export function durationMinutesLabel(minutes: number): string {
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
