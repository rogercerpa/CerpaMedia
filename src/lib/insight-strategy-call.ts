export const INSIGHT_STRATEGY_CALL_KEY = "insight-strategy-call";
export const STRATEGY_CALL_HREF = "/consult";

export type InsightStrategyCallCopy = {
  headline: string;
  creditLine: string;
  buttonLabel: string;
};

export const DEFAULT_INSIGHT_STRATEGY_CALL: InsightStrategyCallCopy = {
  headline: "Leave with a 1-page AI teammate plan for your business",
  creditLine:
    "If you purchase AI Teammate Launch within 30 days of your Strategy Call, the $99 is credited toward that purchase.",
  buttonLabel: "Book the $99 Strategy Call",
};

const SIZE_FRAMING = /\bsmbs?\b|small[\s-]business(?:es)?/i;
const STREET_ADDRESS =
  /\b\d{1,6}\s+[a-z0-9.'’-]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl)\b\.?/i;

export function copyViolatesPublicRules(text: string): string | null {
  if (SIZE_FRAMING.test(text)) {
    return "Say business owners, or you and your team. Don't say small business or SMB.";
  }
  if (STREET_ADDRESS.test(text)) {
    return "Don't include a street address.";
  }
  return null;
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ");
  if (!text || text.length > max) return null;
  if (copyViolatesPublicRules(text)) return null;
  return text;
}

export function sanitizeInsightStrategyCallCopy(input: unknown): InsightStrategyCallCopy {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const headline = cleanText(raw.headline, 160) ?? DEFAULT_INSIGHT_STRATEGY_CALL.headline;
  let creditLine = cleanText(raw.creditLine, 400) ?? DEFAULT_INSIGHT_STRATEGY_CALL.creditLine;
  if (
    !/\$99/.test(creditLine) ||
    !/ai teammate launch/i.test(creditLine) ||
    !/30 days/i.test(creditLine)
  ) {
    creditLine = DEFAULT_INSIGHT_STRATEGY_CALL.creditLine;
  }
  let buttonLabel = cleanText(raw.buttonLabel, 80) ?? DEFAULT_INSIGHT_STRATEGY_CALL.buttonLabel;
  if (!/\$99/.test(buttonLabel)) {
    buttonLabel = DEFAULT_INSIGHT_STRATEGY_CALL.buttonLabel;
  }
  return { headline, creditLine, buttonLabel };
}

export function validateInsightStrategyCallCopy(
  input: unknown
): { ok: true; value: InsightStrategyCallCopy } | { ok: false; error: string } {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : null;
  if (!raw) return { ok: false, error: "Enter the headline, credit line, and button label." };

  const fields: Array<[string, unknown, number]> = [
    ["Headline", raw.headline, 160],
    ["Credit line", raw.creditLine, 400],
    ["Button label", raw.buttonLabel, 80],
  ];
  const cleaned: Record<string, string> = {};
  for (const [label, value, max] of fields) {
    if (typeof value !== "string" || !value.trim()) {
      return { ok: false, error: `${label} is required.` };
    }
    const text = value.trim().replace(/\s+/g, " ");
    if (text.length > max) {
      return { ok: false, error: `${label} must be ${max} characters or fewer.` };
    }
    const violation = copyViolatesPublicRules(text);
    if (violation) return { ok: false, error: `${label}: ${violation}` };
    cleaned[label] = text;
  }

  if (!/\$99/.test(cleaned["Credit line"]) || !/ai teammate launch/i.test(cleaned["Credit line"]) || !/30 days/i.test(cleaned["Credit line"])) {
    return {
      ok: false,
      error: "Credit line must say the $99 is credited toward AI Teammate Launch within 30 days.",
    };
  }
  if (!/\$99/.test(cleaned["Button label"])) {
    return { ok: false, error: "Button label must include $99. The article page keeps a single $99 button." };
  }

  return {
    ok: true,
    value: {
      headline: cleaned.Headline,
      creditLine: cleaned["Credit line"],
      buttonLabel: cleaned["Button label"],
    },
  };
}

export function reactNodeText(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return reactNodeText(props?.children);
  }
  return "";
}

/** In-article markdown links that already pitch the $99 call. The box is the only button. */
export function isInBodyStrategyCallLink(href: string | undefined, text: string): boolean {
  if (!href || !/\$99/.test(text)) return false;
  const path = href
    .trim()
    .replace(/^https?:\/\/(www\.)?cerpamedia\.com/i, "")
    .split("#")[0]
    ?.split("?")[0] ?? "";
  return path === STRATEGY_CALL_HREF || path === `${STRATEGY_CALL_HREF}/`;
}
