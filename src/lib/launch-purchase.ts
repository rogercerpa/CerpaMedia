import { randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { isUniqueConflict } from "./db-errors";
import { getEmailFrom, getEmailReplyTo } from "./email";
import { renderLaunchPurchaseNotice } from "@/emails/messages";
import {
  classifyLaunchCheckout,
  extractBuyer,
  extractPromoCode,
  formatPurchaseAmount,
  isPaidCheckout,
  launchSetupUrl,
  stripeDashboardSessionUrl,
  type LaunchCheckoutSession,
} from "./launch-checkout";

const CLAIM_STALE_MS = 2 * 60 * 1000;

export type LaunchNotifyStatus = "notified" | "duplicate" | "unpaid" | "ignored";

export async function notifyLaunchPurchase(
  session: LaunchCheckoutSession,
  eventId: string
): Promise<LaunchNotifyStatus> {
  const classified = classifyLaunchCheckout(session);
  if (!classified) return "ignored";
  if (!isPaidCheckout(session)) return "unpaid";

  const buyer = extractBuyer(session);
  const promoCode = extractPromoCode(session);
  const amountDisplay = formatPurchaseAmount(session.amount_total, session.currency || "usd");
  const livemode = Boolean(session.livemode);

  let purchase = await prisma.launchPurchase.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (!purchase) {
    try {
      purchase = await prisma.launchPurchase.create({
        data: {
          stripeSessionId: session.id,
          stripeEventId: eventId || null,
          paymentLinkId: classified.paymentLinkId,
          tier: classified.tier,
          offer: classified.offer,
          amountTotal: session.amount_total ?? null,
          currency: (session.currency || "usd").toLowerCase(),
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone,
          promoCode,
          bookingToken: randomBytes(32).toString("base64url"),
          livemode,
        },
      });
    } catch (error) {
      if (!isUniqueConflict(error)) throw error;
      purchase =
        (await prisma.launchPurchase.findUnique({
          where: { stripeSessionId: session.id },
        })) ||
        (eventId
          ? await prisma.launchPurchase.findUnique({
              where: { stripeEventId: eventId },
            })
          : null);
      if (!purchase) throw error;
    }
  }

  if (purchase.adminNotifiedAt) return "duplicate";

  const staleBefore = new Date(Date.now() - CLAIM_STALE_MS);
  const claimed = await prisma.launchPurchase.updateMany({
    where: {
      id: purchase.id,
      adminNotifiedAt: null,
      OR: [{ notifyClaimedAt: null }, { notifyClaimedAt: { lt: staleBefore } }],
    },
    data: { notifyClaimedAt: new Date() },
  });

  if (claimed.count === 0) {
    const latest = await prisma.launchPurchase.findUnique({
      where: { id: purchase.id },
    });
    if (latest?.adminNotifiedAt) return "duplicate";
    throw new Error("Launch purchase notification is already in progress");
  }

  const dashboardUrl = stripeDashboardSessionUrl(session.id, livemode);
  const schedulingUrl = launchSetupUrl(purchase.bookingToken);

  try {
    await sendLaunchAdminEmail({
      buyerName: purchase.buyerName || buyer.name || "",
      buyerEmail: purchase.buyerEmail || buyer.email || "",
      buyerPhone: purchase.buyerPhone || buyer.phone || "",
      amountDisplay,
      tier: purchase.tier,
      promoCode: purchase.promoCode || "",
      stripeSessionId: session.id,
      dashboardUrl,
      schedulingUrl,
    });
  } catch (error) {
    await prisma.launchPurchase.update({
      where: { id: purchase.id },
      data: { notifyClaimedAt: null },
    });
    throw error;
  }

  await prisma.launchPurchase.update({
    where: { id: purchase.id },
    data: { adminNotifiedAt: new Date() },
  });

  return "notified";
}

async function sendLaunchAdminEmail(input: {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amountDisplay: string;
  tier: string;
  promoCode: string;
  stripeSessionId: string;
  dashboardUrl: string;
  schedulingUrl: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const resend = new Resend(resendKey);
  const notice = await renderLaunchPurchaseNotice({
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    buyerPhone: input.buyerPhone,
    amountDisplay: input.amountDisplay,
    tier: input.tier,
    promoCode: input.promoCode || "None",
    stripeSessionId: input.stripeSessionId,
    dashboardUrl: input.dashboardUrl,
    schedulingUrl: input.schedulingUrl,
  });

  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: process.env.CONTACT_TO_EMAIL || "cerpamedia@gmail.com",
    replyTo: input.buyerEmail || getEmailReplyTo(),
    subject: notice.subject,
    html: notice.html,
    text: notice.text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Resend rejected the launch purchase email");
  }
}
