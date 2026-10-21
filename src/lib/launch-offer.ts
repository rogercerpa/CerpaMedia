/**
 * Public pricing for AI Teammate Launch.
 * The founding payment link is the source of truth for how many $799 spots remain.
 * Stripe deactivates that link at the completed-session limit.
 */

export const FOUNDING_PAYMENT_LINK_ID = "plink_1USzOFLWB701MBwCDe8aq52M";
export const REGULAR_PAYMENT_LINK_ID = "plink_1UT02DLWB701MBwCJQQSHnAb";
export const FOUNDING_CHECKOUT_URL = "https://buy.stripe.com/7sY7sM3Ts2iofl9cXL4Vy01";
export const REGULAR_CHECKOUT_URL = "https://buy.stripe.com/5kQ5kE75Ef5aeh50aZ4Vy02";

export const FOUNDING_PRICE_DISPLAY = "$799";
export const REGULAR_PRICE_DISPLAY = "$1,199";

const META_TOOLS =
  "We set up Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork — you own the accounts.";

export type LaunchOfferStatus = "founding" | "regular" | "unknown";

export type LaunchOffer = {
  status: LaunchOfferStatus;
  /** Remaining founding spots. Null when Stripe could not be read. */
  spotsLeft: number | null;
  spotsLimit: number | null;
  checkoutUrl: string;
  priceDisplay: string;
  buttonLabel: string;
  /** True only when the count came from Stripe and founding spots remain. */
  showSpotCount: boolean;
};

export type FoundingLinkSnapshot = {
  active: boolean;
  completedSessionsLimit: number | null;
  completedSessionsCount: number | null;
};

export function fallbackLaunchOffer(): LaunchOffer {
  return {
    status: "unknown",
    spotsLeft: null,
    spotsLimit: null,
    checkoutUrl: FOUNDING_CHECKOUT_URL,
    priceDisplay: FOUNDING_PRICE_DISPLAY,
    buttonLabel: "Reserve my founding spot — $799",
    showSpotCount: false,
  };
}

export function regularLaunchOffer(spotsLimit: number | null = null): LaunchOffer {
  return {
    status: "regular",
    spotsLeft: 0,
    spotsLimit,
    checkoutUrl: REGULAR_CHECKOUT_URL,
    priceDisplay: REGULAR_PRICE_DISPLAY,
    buttonLabel: "Get your AI Teammate Launch — $1,199",
    showSpotCount: false,
  };
}

export function foundingLaunchOffer(spotsLeft: number, spotsLimit: number): LaunchOffer {
  return {
    status: "founding",
    spotsLeft,
    spotsLimit,
    checkoutUrl: FOUNDING_CHECKOUT_URL,
    priceDisplay: FOUNDING_PRICE_DISPLAY,
    buttonLabel: "Reserve my founding spot — $799",
    showSpotCount: true,
  };
}

/**
 * Map a founding payment link to the offer visitors should see.
 * A null snapshot means the Stripe read failed: keep the founding link and hide the count.
 */
export function resolveLaunchOffer(snapshot: FoundingLinkSnapshot | null): LaunchOffer {
  if (!snapshot) return fallbackLaunchOffer();

  const limit = snapshot.completedSessionsLimit;
  const count = snapshot.completedSessionsCount;
  const hasCap = typeof limit === "number" && limit > 0 && typeof count === "number" && count >= 0;

  if (!snapshot.active) {
    return regularLaunchOffer(hasCap ? limit : null);
  }

  if (!hasCap || limit == null) return fallbackLaunchOffer();

  const spotsLeft = Math.max(0, limit - count);
  if (spotsLeft === 0) return regularLaunchOffer(limit);
  return foundingLaunchOffer(spotsLeft, limit);
}

export function launchSpotLine(offer: LaunchOffer): string | null {
  if (!offer.showSpotCount || offer.spotsLeft == null || offer.spotsLimit == null) return null;
  return `${offer.spotsLeft} of ${offer.spotsLimit} founding spots left.`;
}

export function launchPriceLine(offer: LaunchOffer): string {
  if (offer.status === "regular") return offer.priceDisplay;
  return `${FOUNDING_PRICE_DISPLAY} founding rate · Regular ${REGULAR_PRICE_DISPLAY}`;
}

export function launchBadge(offer: LaunchOffer): string | null {
  if (offer.status === "regular") return null;
  return `First 5 clients · ${FOUNDING_PRICE_DISPLAY} founding rate`;
}

export function launchServiceCard(offer: LaunchOffer): { priceLabel: string; badgeText: string | null } {
  if (offer.status === "regular") {
    return { priceLabel: REGULAR_PRICE_DISPLAY, badgeText: null };
  }
  const spotLine = launchSpotLine(offer);
  if (spotLine) {
    return {
      priceLabel: `${FOUNDING_PRICE_DISPLAY} founding price · Regular ${REGULAR_PRICE_DISPLAY}`,
      badgeText: spotLine.replace(/\.$/, ""),
    };
  }
  return {
    priceLabel: `${FOUNDING_PRICE_DISPLAY} founding price for the first 5 clients · Regular ${REGULAR_PRICE_DISPLAY}`,
    badgeText: "First 5 clients · Founding rate",
  };
}

export function launchHomeOfferText(offer: LaunchOffer): string {
  if (offer.status === "regular") return `${REGULAR_PRICE_DISPLAY}.`;
  const spotLine = launchSpotLine(offer);
  if (spotLine) return `${FOUNDING_PRICE_DISPLAY} founding rate · ${spotLine}`;
  return `${FOUNDING_PRICE_DISPLAY} founding rate for the first 5 clients.`;
}

export function launchMetaDescription(offer: LaunchOffer): string {
  const lead = "Your first two AI employees working in 14 days.";
  if (offer.status === "regular") {
    return `${lead} ${REGULAR_PRICE_DISPLAY}. ${META_TOOLS}`;
  }
  const spotLine = launchSpotLine(offer);
  if (spotLine) {
    return `${lead} ${FOUNDING_PRICE_DISPLAY} founding rate, ${spotLine.replace(/\.$/, "")}. ${META_TOOLS}`;
  }
  return `${lead} ${FOUNDING_PRICE_DISPLAY} founding rate for the first 5 clients. ${META_TOOLS}`;
}

const STALE_OFFER_COPY = /\$799|\$1,199|founding rate|first 5 clients/i;

/** Prefer a CMS description only when it does not make a price or founding-spot claim. */
export function launchPageDescription(offer: LaunchOffer, cmsDescription?: string): string {
  if (cmsDescription && !STALE_OFFER_COPY.test(cmsDescription)) return cmsDescription;
  return launchMetaDescription(offer);
}

export function launchBottomHeading(offer: LaunchOffer): string {
  if (offer.status === "regular") return "Get your AI Teammate Launch";
  return `Claim your ${FOUNDING_PRICE_DISPLAY} founding rate`;
}

export function launchBottomSubline(offer: LaunchOffer): string | null {
  if (offer.status === "regular") return null;
  const spotLine = launchSpotLine(offer);
  if (spotLine) return `${spotLine.replace(/\.$/, "")}. 4 launch slots per month.`;
  return "First 5 clients only. 4 launch slots per month.";
}

export function launchPaymentPhrase(offer: LaunchOffer): string {
  if (offer.status === "regular") return offer.priceDisplay;
  return `${offer.priceDisplay} founding rate`;
}
