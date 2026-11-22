import { presentHeroSubheadline } from "./reword-small-business";

export interface HeroPair {
  headline: string;
  subheadline: string;
}

export interface HeroContent {
  /** Pair 1. This is the page h1 and the server-rendered headline. */
  headline: string;
  /** Pair 1 supporting line. */
  subheadline: string;
  pairs: HeroPair[];
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
}

/**
 * Built-in hero lines, in rotation order. Pair 1 is the h1.
 *
 * The public page rotates a stored `home-hero` row only when its JSON has
 * a non-empty `pairs` list. Production still stores the older single
 * headline and has no `pairs` field. That row keeps its call-to-action
 * fields and shows these lines, with no database write on deploy.
 */
export const DEFAULT_HERO_PAIRS: readonly HeroPair[] = [
  {
    headline: "From idea to working system in days, not months.",
    subheadline:
      "AI changed how fast real things get built. We help you and your team plan it, build it and own it, without the hype.",
  },
  {
    headline: "Build more. Build better. In a fraction of the time.",
    subheadline:
      'Practical web apps, AI teammates and automation that move your goals from "someday" to this week.',
  },
  {
    headline: "The AI era is here. Put it to work for you.",
    subheadline:
      "We turn your ideas into working apps and AI teammates in days, with a clear plan first, and you own the accounts and code.",
  },
  {
    headline: "Prototype Monday. Production by Friday.",
    subheadline:
      "AI-powered builds that go from sketch to live in days, planned with you and owned by you.",
  },
  {
    headline: "Reach further, faster.",
    subheadline:
      "AI teammates and custom apps that take the busywork so you and your team can go after bigger goals.",
  },
];

/** Headline stored on production before the rotating list existed. */
export const LEGACY_HERO_HEADLINE =
  "Stop losing hours to tools that don't talk to each other.";

function cloneDefaultPairs(): HeroPair[] {
  return DEFAULT_HERO_PAIRS.map((pair) => ({
    headline: pair.headline,
    subheadline: pair.subheadline,
  }));
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isLegacyHeadline(headline: string): boolean {
  const normalized = headline
    .trim()
    .replace(/[’‘´]/g, "'")
    .replace(/\s+/g, " ");
  return normalized === LEGACY_HERO_HEADLINE;
}

function readPair(value: unknown): HeroPair | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const headline = readString(record.headline).trim();
  const subheadline = readString(record.subheadline).trim();
  if (!headline || !subheadline) return null;
  return {
    headline,
    subheadline: presentHeroSubheadline(subheadline),
  };
}

/** Valid pairs from a stored list, or null when the list is missing or empty. */
export function resolveHeroPairs(rawPairs: unknown): HeroPair[] | null {
  if (!Array.isArray(rawPairs)) return null;
  const pairs = rawPairs
    .map(readPair)
    .filter((pair): pair is HeroPair => pair !== null);
  return pairs.length > 0 ? pairs : null;
}

export function hasSavedHeroPairs(raw: unknown): boolean {
  return resolveHeroPairs(asRecord(raw).pairs) !== null;
}

/**
 * A non-legacy headline saved in the old single-headline shape.
 * The public page does not show it until it is added to `pairs`.
 * The admin editor quotes it so the line is not lost on the next save.
 */
export function previousSingleHeadline(raw: unknown): string | null {
  if (hasSavedHeroPairs(raw)) return null;
  const headline = readString(asRecord(raw).headline).trim();
  if (!headline || isLegacyHeadline(headline)) return null;
  return headline;
}

export function resolveHeroContent(raw: unknown): HeroContent {
  const record = asRecord(raw);
  const pairs = resolveHeroPairs(record.pairs) ?? cloneDefaultPairs();
  const first = pairs[0];

  return {
    pairs,
    headline: first.headline,
    subheadline: first.subheadline,
    primaryCtaLabel: readString(record.primaryCtaLabel),
    primaryCtaUrl: readString(record.primaryCtaUrl),
    secondaryCtaLabel: readString(record.secondaryCtaLabel),
    secondaryCtaUrl: readString(record.secondaryCtaUrl),
  };
}
