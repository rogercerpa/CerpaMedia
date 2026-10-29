export const INSIGHT_STRATEGY_CALL_KEY = "insight-strategy-call";
export const STRATEGY_CALL_HREF = "/consult";
export const STRATEGY_CALL_BUTTON_LABEL = "Book your strategy call today";

export type InsightStrategyCallCopy = {
  headline: string;
  creditLine: string;
  buttonLabel: string;
};

export const DEFAULT_INSIGHT_STRATEGY_CALL: InsightStrategyCallCopy = {
  headline: "Leave with a 1-page AI teammate plan for your business",
  creditLine:
    "Your call fee counts toward an AI Teammate Launch if you purchase it within 30 days.",
  buttonLabel: STRATEGY_CALL_BUTTON_LABEL,
};

const SIZE_FRAMING = /\bsmbs?\b|small[\s-]business(?:es)?/i;
const STREET_ADDRESS =
  /\b\d{1,6}\s+[a-z0-9.'’-]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl)\b\.?/i;
const PRICE_MENTION = /\$\s*\d|\b\d+\s*dollars?\b/i;

export function copyViolatesPublicRules(text: string): string | null {
  if (SIZE_FRAMING.test(text)) {
    return "Say business owners, or you and your team. Don't say small business or SMB.";
  }
  if (STREET_ADDRESS.test(text)) {
    return "Don't include a street address.";
  }
  if (PRICE_MENTION.test(text)) {
    return "Don't mention a price in this box.";
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
  if (!/ai teammate launch/i.test(creditLine) || !/counts toward/i.test(creditLine)) {
    creditLine = DEFAULT_INSIGHT_STRATEGY_CALL.creditLine;
  }
  return {
    headline,
    creditLine,
    buttonLabel: STRATEGY_CALL_BUTTON_LABEL,
  };
}

export function validateInsightStrategyCallCopy(
  input: unknown
): { ok: true; value: InsightStrategyCallCopy } | { ok: false; error: string } {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : null;
  if (!raw) return { ok: false, error: "Enter the headline and credit line." };

  const fields: Array<[string, unknown, number]> = [
    ["Headline", raw.headline, 160],
    ["Credit line", raw.creditLine, 400],
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

  if (!/ai teammate launch/i.test(cleaned["Credit line"]) || !/counts toward/i.test(cleaned["Credit line"])) {
    return {
      ok: false,
      error: "Credit line must say the call fee counts toward an AI Teammate Launch.",
    };
  }

  return {
    ok: true,
    value: {
      headline: cleaned.Headline,
      creditLine: cleaned["Credit line"],
      buttonLabel: STRATEGY_CALL_BUTTON_LABEL,
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

const OFFER_PRICE = /\$\s*(?:99|149|799|1,199)\b/;

export function consultPath(href: string | undefined): boolean {
  if (!href) return false;
  const path = href
    .trim()
    .replace(/^https?:\/\/(?:www\.)?cerpamedia\.com/i, "")
    .split("#")[0]
    ?.split("?")[0] ?? "";
  return path === STRATEGY_CALL_HREF || path === `${STRATEGY_CALL_HREF}/`;
}

/** In-article or CMS labels that still name the strategy-call price. */
export function isInBodyStrategyCallLink(href: string | undefined, text: string): boolean {
  if (!href || !OFFER_PRICE.test(text)) return false;
  return consultPath(href);
}

/**
 * Insights bodies stay in the database. This only changes what the article
 * template shows, so offer prices stay on the consult and Launch pages.
 * Third-party prices (a vendor's own plans, a reported savings figure) stay.
 */
export function presentInsightArticleBody(body: string): string {
  let text = body.replace(
    /book a \$99 Technology Strategy Call at \[([^\]]*)\]\(([^)]+)\)/gi,
    "[book your strategy call today]($2)"
  );
  text = text.replace(
    /book a \[\$99 Strategy Call\]\(([^)]+)\)/gi,
    "[book your strategy call today]($1)"
  );
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (full, label: string, href: string) => {
    if (!OFFER_PRICE.test(label)) return full;
    if (consultPath(href)) return `[strategy call](${href})`;
    return full;
  });
  text = text.replace(/Technology Strategy Call \(\$99\)/g, "Technology Strategy Call");
  text = text.replace(/Strategy Call \(\$99\)/g, "Strategy Call");
  text = text.replace(
    /Founding rate is \$799 for the first clients\./g,
    "Current founding details are on the [AI Teammate Launch](/services/ai-teammate-launch) page."
  );
  return text;
}
