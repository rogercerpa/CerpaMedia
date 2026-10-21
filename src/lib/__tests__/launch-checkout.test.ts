import { describe, expect, it } from "vitest";
import {
  FOUNDING_PAYMENT_LINK_ID,
  REGULAR_PAYMENT_LINK_ID,
} from "../launch-offer";
import {
  classifyLaunchCheckout,
  extractBuyer,
  extractPromoCode,
  formatPurchaseAmount,
  isPaidCheckout,
  launchPurchaseSubject,
  stripeDashboardSessionUrl,
  type LaunchCheckoutSession,
} from "../launch-checkout";

const FOUNDING = "plink_1USzOFLWB701MBwCDe8aq52M";
const REGULAR = "plink_1UT02DLWB701MBwCJQQSHnAb";

describe("launch checkout classification", () => {
  it("keeps the live payment link ids", () => {
    expect(FOUNDING_PAYMENT_LINK_ID).toBe(FOUNDING);
    expect(REGULAR_PAYMENT_LINK_ID).toBe(REGULAR);
  });

  it("recognizes the founding and regular payment links", () => {
    expect(classifyLaunchCheckout(session({ payment_link: FOUNDING }))).toMatchObject({
      tier: "founding",
      offer: "ai-teammate-launch",
      paymentLinkId: FOUNDING,
    });
    expect(classifyLaunchCheckout(session({ payment_link: { id: REGULAR } }))).toMatchObject({
      tier: "regular",
      paymentLinkId: REGULAR,
    });
  });

  it("recognizes offer metadata when the payment link id is absent", () => {
    expect(
      classifyLaunchCheckout(
        session({
          metadata: { offer: "ai-teammate-launch", tier: "founding" },
        })
      )
    ).toMatchObject({ tier: "founding", offer: "ai-teammate-launch" });
  });

  it("lets the known payment link win over a mismatched tier", () => {
    expect(
      classifyLaunchCheckout(
        session({
          payment_link: FOUNDING,
          metadata: { offer: "ai-teammate-launch", tier: "regular" },
        })
      )?.tier
    ).toBe("founding");
  });

  it("ignores strategy-call checkouts", () => {
    expect(classifyLaunchCheckout(session({ metadata: { holdId: "hold_1" } }))).toBeNull();
    expect(classifyLaunchCheckout(session({}))).toBeNull();
  });
});

describe("launch purchase details", () => {
  it("formats founding and regular amounts", () => {
    expect(formatPurchaseAmount(79900)).toBe("$799");
    expect(formatPurchaseAmount(119900)).toBe("$1,199");
    expect(formatPurchaseAmount(79950)).toBe("$799.50");
    expect(launchPurchaseSubject("founding", "$799")).toBe(
      "New AI Teammate Launch purchase — founding $799"
    );
    expect(launchPurchaseSubject("regular", "$1,199")).toBe(
      "New AI Teammate Launch purchase — regular $1,199"
    );
  });

  it("reads the buyer and a human promo code", () => {
    const paid = session({
      customer_details: {
        name: "Avery Buyer",
        email: "avery@example.com",
        phone: "+14045550199",
      },
      discounts: [{ promotion_code: { code: "LAUNCH10" } }],
    });
    expect(extractBuyer(paid)).toEqual({
      name: "Avery Buyer",
      email: "avery@example.com",
      phone: "+14045550199",
    });
    expect(extractPromoCode(paid)).toBe("LAUNCH10");
    expect(extractPromoCode(session({}))).toBeNull();
    expect(isPaidCheckout(session({ payment_status: "unpaid" }))).toBe(false);
    expect(isPaidCheckout(session({ payment_status: "paid" }))).toBe(true);
  });

  it("points the dashboard link at test mode when the session is not live", () => {
    expect(stripeDashboardSessionUrl("cs_test_1", false)).toBe(
      "https://dashboard.stripe.com/test/checkout/sessions/cs_test_1"
    );
    expect(stripeDashboardSessionUrl("cs_live_1", true)).toBe(
      "https://dashboard.stripe.com/checkout/sessions/cs_live_1"
    );
  });
});

function session(overrides: Partial<LaunchCheckoutSession> = {}): LaunchCheckoutSession {
  return {
    id: "cs_test_1",
    payment_status: "paid",
    livemode: false,
    amount_total: 79900,
    currency: "usd",
    ...overrides,
  };
}
