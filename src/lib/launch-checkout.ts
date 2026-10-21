import {
  FOUNDING_PAYMENT_LINK_ID,
  REGULAR_PAYMENT_LINK_ID,
} from "./launch-offer";
import { LAUNCH_OFFER, launchSetupPath } from "./launch-booking-shared";

export const LAUNCH_LINK_TIERS: Record<string, "founding" | "regular"> = {
  [FOUNDING_PAYMENT_LINK_ID]: "founding",
  [REGULAR_PAYMENT_LINK_ID]: "regular",
};

const CLAIM_TIER = /^[a-z0-9_-]{1,32}$/;

export interface LaunchCheckoutDiscount {
  promotion_code?: string | { id?: string | null; code?: string | null } | null;
  coupon?: string | { id?: string | null; name?: string | null } | null;
}

export interface LaunchCheckoutCustomField {
  key?: string | null;
  label?: string | { custom?: string | null } | null;
  text?: { value?: string | null } | null;
  numeric?: { value?: string | null } | null;
  dropdown?: { value?: string | null } | null;
}

export interface LaunchCheckoutSession {
  id: string;
  payment_status?: string | null;
  payment_link?: string | { id?: string | null } | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string> | null;
  livemode?: boolean | null;
  discounts?: LaunchCheckoutDiscount[] | null;
  custom_fields?: LaunchCheckoutCustomField[] | null;
  total_details?: {
    breakdown?: {
      discounts?: Array<{ discount?: LaunchCheckoutDiscount | null }> | null;
    } | null;
  } | null;
}

export interface LaunchClassification {
  tier: string;
  offer: string;
  paymentLinkId: string | null;
}

export interface LaunchBuyer {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export function paymentLinkIdOf(session: LaunchCheckoutSession): string | null {
  const link = session.payment_link;
  if (!link) return null;
  if (typeof link === "string") return link;
  return link.id || null;
}

export function classifyLaunchCheckout(session: LaunchCheckoutSession): LaunchClassification | null {
  const paymentLinkId = paymentLinkIdOf(session);
  const linkTier = paymentLinkId ? LAUNCH_LINK_TIERS[paymentLinkId] : undefined;
  const offer = session.metadata?.offer?.trim() || "";
  if (!linkTier && offer !== LAUNCH_OFFER) return null;

  const tier = linkTier ?? normalizeTier(session.metadata?.tier, "regular");
  return {
    tier,
    offer: offer || LAUNCH_OFFER,
    paymentLinkId,
  };
}

export function isLaunchCheckout(session: LaunchCheckoutSession): boolean {
  return classifyLaunchCheckout(session) !== null;
}

export function isPaidCheckout(session: LaunchCheckoutSession): boolean {
  const status = session.payment_status;
  if (!status) return true;
  return status === "paid" || status === "no_payment_required";
}

export function formatPurchaseAmount(
  cents: number | null | undefined,
  currency = "usd"
): string {
  if (cents == null || !Number.isFinite(cents)) return "Unknown";
  const amount = cents / 100;
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    return whole ? `$${amount}` : `$${amount.toFixed(2)}`;
  }
}

export function launchPurchaseSubject(tier: string, amountDisplay: string): string {
  return `New AI Teammate Launch purchase — ${tier} ${amountDisplay}`;
}

export function stripeDashboardSessionUrl(sessionId: string, livemode: boolean): string {
  const mode = livemode ? "" : "/test";
  return `https://dashboard.stripe.com${mode}/checkout/sessions/${encodeURIComponent(sessionId)}`;
}

export function publicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://cerpamedia.com";
}

export function launchSetupUrl(token: string, baseUrl = publicBaseUrl()): string {
  return `${baseUrl.replace(/\/$/, "")}${launchSetupPath(token)}`;
}

export function extractBuyer(session: LaunchCheckoutSession): LaunchBuyer {
  const details = session.customer_details;
  const name = clean(details?.name) || customField(session, /name/i);
  const email = clean(details?.email) || clean(session.customer_email) || customField(session, /e-?mail/i);
  const phone = clean(details?.phone) || customField(session, /phone|mobile|tel/i);
  return { name, email, phone };
}

export function extractPromoCode(session: LaunchCheckoutSession): string | null {
  const fromMetadata = clean(session.metadata?.promo_code) || clean(session.metadata?.promotion_code);
  if (fromMetadata) return fromMetadata;

  const discounts: LaunchCheckoutDiscount[] = [
    ...(session.discounts ?? []),
    ...((session.total_details?.breakdown?.discounts ?? [])
      .map((entry) => entry.discount)
      .filter((discount): discount is LaunchCheckoutDiscount => Boolean(discount))),
  ];

  let fallbackId: string | null = null;
  for (const discount of discounts) {
    const promo = discount.promotion_code;
    if (promo && typeof promo === "object") {
      const code = clean(promo.code);
      if (code) return code;
      if (!fallbackId && promo.id) fallbackId = promo.id;
    } else if (typeof promo === "string" && promo.trim()) {
      if (!promo.startsWith("promo_")) return promo.trim();
      fallbackId = fallbackId || promo.trim();
    }

    const coupon = discount.coupon;
    if (coupon && typeof coupon === "object") {
      const name = clean(coupon.name);
      if (name) return name;
      if (!fallbackId && coupon.id) fallbackId = coupon.id;
    } else if (typeof coupon === "string" && coupon.trim() && !coupon.startsWith("coupon_")) {
      return coupon.trim();
    }
  }

  return fallbackId;
}

function normalizeTier(value: string | undefined, fallback: "founding" | "regular"): string {
  const tier = value?.trim().toLowerCase() || "";
  if (CLAIM_TIER.test(tier)) return tier;
  return fallback;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function customField(session: LaunchCheckoutSession, labelPattern: RegExp): string | null {
  for (const field of session.custom_fields ?? []) {
    const label = fieldLabel(field);
    if (!labelPattern.test(label) && !labelPattern.test(field.key || "")) continue;
    const value = clean(field.text?.value) || clean(field.numeric?.value) || clean(field.dropdown?.value);
    if (value) return value;
  }
  return null;
}

function fieldLabel(field: LaunchCheckoutCustomField): string {
  if (!field.label) return field.key || "";
  if (typeof field.label === "string") return field.label;
  return field.label.custom || field.key || "";
}
