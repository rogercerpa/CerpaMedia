import { unstable_cache } from "next/cache";
import Stripe from "stripe";
import {
  FOUNDING_PAYMENT_LINK_ID,
  fallbackLaunchOffer,
  resolveLaunchOffer,
  type FoundingLinkSnapshot,
} from "./launch-offer";

const REVALIDATE_SECONDS = 60;

async function readFoundingLink(): Promise<FoundingLinkSnapshot | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  const stripe = new Stripe(key, {
    apiVersion: "2026-09-30.endive",
  });
  const link = await stripe.paymentLinks.retrieve(FOUNDING_PAYMENT_LINK_ID);
  const sessions = link.restrictions?.completed_sessions;
  if (!sessions) {
    return {
      active: link.active,
      completedSessionsLimit: null,
      completedSessionsCount: null,
    };
  }

  return {
    active: link.active,
    completedSessionsLimit: sessions.limit,
    completedSessionsCount: sessions.count,
  };
}

async function loadLaunchOffer() {
  try {
    return resolveLaunchOffer(await readFoundingLink());
  } catch {
    return fallbackLaunchOffer();
  }
}

export const getLaunchOffer = unstable_cache(loadLaunchOffer, ["launch-offer"], {
  revalidate: REVALIDATE_SECONDS,
});
