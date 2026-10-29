import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { InsightStrategyCallBox } from "@/components/InsightStrategyCallBox";
import {
  DEFAULT_INSIGHT_STRATEGY_CALL,
  isInBodyStrategyCallLink,
  presentInsightArticleBody,
  sanitizeInsightStrategyCallCopy,
  validateInsightStrategyCallCopy,
} from "@/lib/insight-strategy-call";

describe("insight strategy call box", () => {
  it("renders one strategy-call button and no price or founding-spots count", () => {
    const html = renderToStaticMarkup(
      <InsightStrategyCallBox copy={DEFAULT_INSIGHT_STRATEGY_CALL} />
    );

    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain('href="/consult"');
    expect(html).toContain("Book your strategy call today");
    expect(html).toContain("Leave with a 1-page AI teammate plan for your business");
    expect(html).toContain("Your call fee counts toward an AI Teammate Launch");
    expect(html).not.toMatch(/\$\s*\d/);
    expect(html).not.toMatch(/spots left/i);
    expect(html).not.toMatch(/small business|\bSMB\b/i);
    expect(html).not.toMatch(/\b\d{1,6}\s+[a-z0-9.'’-]+\s+(street|avenue|road)\b/i);
  });

  it("falls back when saved copy uses size framing, a price, or drops the credit", () => {
    expect(
      sanitizeInsightStrategyCallCopy({
        headline: "A plan for your small business",
        creditLine: DEFAULT_INSIGHT_STRATEGY_CALL.creditLine,
        buttonLabel: "Book the $99 Strategy Call",
      }).headline
    ).toBe(DEFAULT_INSIGHT_STRATEGY_CALL.headline);

    expect(
      sanitizeInsightStrategyCallCopy({
        headline: "Leave with a plan",
        creditLine: "The $99 is credited toward AI Teammate Launch within 30 days.",
        buttonLabel: "Book the $99 Strategy Call",
      })
    ).toEqual({
      headline: "Leave with a plan",
      creditLine: DEFAULT_INSIGHT_STRATEGY_CALL.creditLine,
      buttonLabel: "Book your strategy call today",
    });

    const rejected = validateInsightStrategyCallCopy({
      headline: "Leave with a plan",
      creditLine: "The $99 is a fee.",
    });
    expect(rejected.ok).toBe(false);

    const saved = validateInsightStrategyCallCopy({
      headline: "Leave with a 1-page AI teammate plan for your business",
      creditLine: "Your call fee counts toward an AI Teammate Launch.",
      buttonLabel: "Pay $99",
    });
    expect(saved).toEqual({
      ok: true,
      value: {
        ...DEFAULT_INSIGHT_STRATEGY_CALL,
        creditLine: "Your call fee counts toward an AI Teammate Launch.",
      },
    });
  });

  it("treats an in-article priced consult link as strategy-call copy", () => {
    expect(isInBodyStrategyCallLink("/consult", "Book a $99 strategy call")).toBe(true);
    expect(isInBodyStrategyCallLink("https://cerpamedia.com/consult", "Book a $99 strategy call")).toBe(true);
    expect(isInBodyStrategyCallLink("/consult", "Book a Technology Strategy Call")).toBe(false);
    expect(isInBodyStrategyCallLink("/services", "Book a $99 strategy call")).toBe(false);
  });

  it("shows Insights article offer prices as links to the offer page", () => {
    const body = presentInsightArticleBody(
      [
        "A [Technology Strategy Call ($99)](https://cerpamedia.com/consult) maps the next step.",
        "A **Technology Strategy Call ($99)** scopes the first use case.",
        "- **Strategy Call ($99):** Walk through your stack.",
        "book a $99 Technology Strategy Call at [/consult](https://cerpamedia.com/consult) and leave with a plan.",
        "book a [$99 Strategy Call](https://cerpamedia.com/consult).",
        "Founding rate is $799 for the first clients.",
        "Free tier plus $20/$100 plans.",
      ].join("\n")
    );

    expect(body).not.toMatch(/\$99|\$799/);
    expect(body).toContain("[strategy call](https://cerpamedia.com/consult)");
    expect(body).toContain("[book your strategy call today](https://cerpamedia.com/consult)");
    expect(body).toContain("[AI Teammate Launch](/services/ai-teammate-launch)");
    expect(body).toContain("Free tier plus $20/$100 plans.");
    expect(body).not.toMatch(/small business|\bSMB\b/i);
  });
});
