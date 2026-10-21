import { describe, expect, it } from "vitest";
import {
  FOUNDING_CHECKOUT_URL,
  REGULAR_CHECKOUT_URL,
  fallbackLaunchOffer,
  foundingLaunchOffer,
  launchHomeOfferText,
  launchPageDescription,
  launchServiceCard,
  launchSpotLine,
  regularLaunchOffer,
  resolveLaunchOffer,
} from "../launch-offer";

describe("resolveLaunchOffer", () => {
  it("shows 5 of 5 when the founding link is active and unused", () => {
    const offer = resolveLaunchOffer({
      active: true,
      completedSessionsLimit: 5,
      completedSessionsCount: 0,
    });

    expect(offer).toEqual(foundingLaunchOffer(5, 5));
    expect(offer.checkoutUrl).toBe(FOUNDING_CHECKOUT_URL);
    expect(offer.buttonLabel).toBe("Reserve my founding spot — $799");
    expect(launchSpotLine(offer)).toBe("5 of 5 founding spots left.");
  });

  it("counts remaining spots from limit minus completed sessions", () => {
    const offer = resolveLaunchOffer({
      active: true,
      completedSessionsLimit: 5,
      completedSessionsCount: 2,
    });

    expect(offer.spotsLeft).toBe(3);
    expect(launchSpotLine(offer)).toBe("3 of 5 founding spots left.");
    expect(launchHomeOfferText(offer)).toBe("$799 founding rate · 3 of 5 founding spots left.");
  });

  it("switches to the $1,199 link when the five founding spots are sold", () => {
    const offer = resolveLaunchOffer({
      active: true,
      completedSessionsLimit: 5,
      completedSessionsCount: 5,
    });

    expect(offer).toEqual(regularLaunchOffer(5));
    expect(offer.checkoutUrl).toBe(REGULAR_CHECKOUT_URL);
    expect(offer.buttonLabel).toBe("Get your AI Teammate Launch — $1,199");
    expect(offer.showSpotCount).toBe(false);
    expect(launchSpotLine(offer)).toBeNull();
    expect(launchServiceCard(offer)).toEqual({ priceLabel: "$1,199", badgeText: null });
    expect(launchHomeOfferText(offer)).toBe("$1,199.");
  });

  it("switches to regular when Stripe has deactivated the founding link", () => {
    const offer = resolveLaunchOffer({
      active: false,
      completedSessionsLimit: 5,
      completedSessionsCount: 5,
    });

    expect(offer.status).toBe("regular");
    expect(offer.checkoutUrl).toBe(REGULAR_CHECKOUT_URL);
  });

  it("treats an inactive link with no cap numbers as the regular offer", () => {
    const offer = resolveLaunchOffer({
      active: false,
      completedSessionsLimit: null,
      completedSessionsCount: null,
    });

    expect(offer.status).toBe("regular");
    expect(offer.showSpotCount).toBe(false);
    expect(offer.checkoutUrl).toBe(REGULAR_CHECKOUT_URL);
  });

  it("falls back to the founding link without a count when the cap is missing", () => {
    const offer = resolveLaunchOffer({
      active: true,
      completedSessionsLimit: null,
      completedSessionsCount: null,
    });

    expect(offer).toEqual(fallbackLaunchOffer());
    expect(offer.showSpotCount).toBe(false);
    expect(launchSpotLine(offer)).toBeNull();
  });

  it("falls back to the founding link when Stripe cannot be read", () => {
    expect(resolveLaunchOffer(null)).toEqual(fallbackLaunchOffer());
  });

  it("replaces CMS descriptions that still advertise the founding price", () => {
    const soldOut = regularLaunchOffer(5);
    expect(launchPageDescription(soldOut, "AI Teammate Launch. $799 founding rate for the first 5 clients.")).toContain(
      "$1,199"
    );
    expect(launchPageDescription(soldOut, "A custom description with no price.")).toBe(
      "A custom description with no price."
    );
  });
});
