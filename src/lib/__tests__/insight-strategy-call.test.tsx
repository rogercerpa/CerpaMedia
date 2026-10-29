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
  sanitizeInsightStrategyCallCopy,
  validateInsightStrategyCallCopy,
} from "@/lib/insight-strategy-call";
import { fallbackLaunchOffer, foundingLaunchOffer, launchSpotLine } from "@/lib/launch-offer";

describe("insight strategy call box", () => {
  it("renders one $99 button and hides the spots count when Stripe did not provide one", () => {
    const html = renderToStaticMarkup(
      <InsightStrategyCallBox
        copy={DEFAULT_INSIGHT_STRATEGY_CALL}
        spotLine={launchSpotLine(fallbackLaunchOffer())}
      />
    );

    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain('href="/consult"');
    expect(html).toContain("Book the $99 Strategy Call");
    expect(html).toContain("Leave with a 1-page AI teammate plan for your business");
    expect(html).toContain("the $99 is credited toward that purchase");
    expect(html).not.toMatch(/spots left/i);
    expect(html).not.toMatch(/small business|\bSMB\b/i);
    expect(html).not.toMatch(/\b\d{1,6}\s+[a-z0-9.'’-]+\s+(street|avenue|road)\b/i);
    expect(launchSpotLine(fallbackLaunchOffer())).toBeNull();
  });

  it("shows the founding spots line only when the existing offer logic has a real count", () => {
    const line = launchSpotLine(foundingLaunchOffer(3, 5));
    const html = renderToStaticMarkup(
      <InsightStrategyCallBox copy={DEFAULT_INSIGHT_STRATEGY_CALL} spotLine={line} />
    );

    expect(line).toBe("3 of 5 founding spots left.");
    expect(html).toContain("3 of 5 founding spots left.");
    expect(html.match(/<a\b/g)).toHaveLength(1);
  });

  it("falls back when saved copy uses size framing or drops the credit", () => {
    expect(
      sanitizeInsightStrategyCallCopy({
        headline: "A plan for your small business",
        creditLine: DEFAULT_INSIGHT_STRATEGY_CALL.creditLine,
        buttonLabel: DEFAULT_INSIGHT_STRATEGY_CALL.buttonLabel,
      }).headline
    ).toBe(DEFAULT_INSIGHT_STRATEGY_CALL.headline);

    const rejected = validateInsightStrategyCallCopy({
      headline: "Leave with a plan",
      creditLine: "The $99 is a fee.",
      buttonLabel: "Book the $99 Strategy Call",
    });
    expect(rejected.ok).toBe(false);
  });

  it("treats an in-article $99 consult link as duplicate copy, not a second button", () => {
    expect(isInBodyStrategyCallLink("/consult", "Book a $99 strategy call")).toBe(true);
    expect(isInBodyStrategyCallLink("https://cerpamedia.com/consult", "Book a $99 strategy call")).toBe(true);
    expect(isInBodyStrategyCallLink("/consult", "Book a Technology Strategy Call")).toBe(false);
    expect(isInBodyStrategyCallLink("/services", "Book a $99 strategy call")).toBe(false);
  });
});
