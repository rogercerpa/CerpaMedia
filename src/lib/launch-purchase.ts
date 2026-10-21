import { randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { isUniqueConflict } from "./db-errors";
import { getEmailFrom, getEmailReplyTo } from "./email";
import { renderLaunchPurchaseNotice, renderLaunchSetupReminder, renderLaunchWelcome } from "@/emails/messages";
import type { LaunchWelcomeDelivery } from "@/emails/launch-purchase-notice";
import { purchasesNeedingReminder } from "./business-days";
import { getIntakeFormUrl } from "./intake-form-url";
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

type PurchaseRow = {
  id: string;
  tier: string;
  amountTotal: number | null;
  currency: string;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  promoCode: string | null;
  bookingToken: string;
  adminNotifiedAt: Date | null;
  welcomeSentAt: Date | null;
  welcomeReminderSentAt: Date | null;
  bookingId: string | null;
  livemode: boolean;
  stripeSessionId: string;
  createdAt: Date;
};

export async function notifyLaunchPurchase(
  session: LaunchCheckoutSession,
  eventId: string
): Promise<LaunchNotifyStatus> {
  const classified = classifyLaunchCheckout(session);
  if (!classified) return "ignored";
  if (!isPaidCheckout(session)) return "unpaid";

  const buyer = extractBuyer(session);
  const promoCode = extractPromoCode(session);
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

  const row = purchase as PurchaseRow;
  const welcomeAlreadyDone = Boolean(row.welcomeSentAt) || !row.buyerEmail;
  if (row.adminNotifiedAt && welcomeAlreadyDone) return "duplicate";

  const amountDisplay = formatPurchaseAmount(
    row.amountTotal ?? session.amount_total,
    row.currency || session.currency || "usd"
  );
  const intakeConfigured = Boolean(getIntakeFormUrl());
  let welcomeDelivery: LaunchWelcomeDelivery = row.welcomeSentAt
    ? "sent"
    : row.buyerEmail
      ? "failed"
      : "missing-email";

  if (row.buyerEmail && !row.welcomeSentAt) {
    const claim = await claimWelcome(row.id);
    if (claim === "busy") {
      throw new Error("Launch welcome email is already in progress");
    }
    if (claim === "done") {
      welcomeDelivery = "sent";
    } else {
      try {
        await deliverLaunchWelcome(row);
        await prisma.launchPurchase.update({
          where: { id: row.id },
          data: { welcomeSentAt: new Date(), welcomeClaimedAt: null },
        });
        welcomeDelivery = "sent";
      } catch (error) {
        await prisma.launchPurchase.update({
          where: { id: row.id },
          data: { welcomeClaimedAt: null },
        });
        welcomeDelivery = "failed";
        console.error("Launch welcome email failed:", row.stripeSessionId || session.id, error);
      }
    }
  }

  if (!row.adminNotifiedAt) {
    const adminClaim = await claimAdmin(row.id);
    if (adminClaim === "busy") {
      throw new Error("Launch purchase notification is already in progress");
    }
    if (adminClaim === "claimed") {
      try {
        await sendLaunchAdminEmail({
          buyerName: row.buyerName || buyer.name || "",
          buyerEmail: row.buyerEmail || buyer.email || "",
          buyerPhone: row.buyerPhone || buyer.phone || "",
          amountDisplay,
          tier: row.tier,
          promoCode: row.promoCode || "",
          stripeSessionId: session.id,
          dashboardUrl: stripeDashboardSessionUrl(session.id, livemode),
          schedulingUrl: launchSetupUrl(row.bookingToken),
          welcomeDelivery,
          intakeConfigured,
        });
      } catch (error) {
        await prisma.launchPurchase.update({
          where: { id: row.id },
          data: { notifyClaimedAt: null },
        });
        throw error;
      }

      await prisma.launchPurchase.update({
        where: { id: row.id },
        data: { adminNotifiedAt: new Date() },
      });
    }
  }

  if (welcomeDelivery === "failed") {
    throw new Error("Launch welcome email failed");
  }

  return "notified";
}

export async function resendLaunchWelcome(
  purchaseId: string
): Promise<"sent" | "failed" | "missing-email"> {
  const purchase = await prisma.launchPurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase?.buyerEmail) return "missing-email";

  try {
    await deliverLaunchWelcome(purchase);
    await prisma.launchPurchase.update({
      where: { id: purchase.id },
      data: { welcomeSentAt: new Date(), welcomeClaimedAt: null },
    });
    return "sent";
  } catch (error) {
    console.error("Launch welcome resend failed:", purchaseId, error);
    return "failed";
  }
}

export async function sendDueLaunchSetupReminders(now = new Date()): Promise<{
  sent: number;
  failed: number;
}> {
  const candidates = await prisma.launchPurchase.findMany({
    where: {
      bookingId: null,
      welcomeReminderSentAt: null,
      buyerEmail: { not: null },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const due = purchasesNeedingReminder(candidates, now);
  let sent = 0;
  let failed = 0;

  for (const purchase of due) {
    const claim = await claimReminder(purchase.id);
    if (claim !== "claimed") continue;
    try {
      await deliverLaunchReminder(purchase);
      await prisma.launchPurchase.update({
        where: { id: purchase.id },
        data: { welcomeReminderSentAt: new Date(), welcomeReminderClaimedAt: null },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      await prisma.launchPurchase.update({
        where: { id: purchase.id },
        data: { welcomeReminderClaimedAt: null },
      });
      console.error("Launch setup reminder failed:", purchase.id, error);
    }
  }

  return { sent, failed };
}

async function claimWelcome(id: string): Promise<"claimed" | "done" | "busy"> {
  return claim(id, "welcomeSentAt", "welcomeClaimedAt");
}

async function claimAdmin(id: string): Promise<"claimed" | "done" | "busy"> {
  return claim(id, "adminNotifiedAt", "notifyClaimedAt");
}

async function claimReminder(id: string): Promise<"claimed" | "done" | "busy"> {
  const staleBefore = new Date(Date.now() - CLAIM_STALE_MS);
  const claimed = await prisma.launchPurchase.updateMany({
    where: {
      id,
      bookingId: null,
      welcomeReminderSentAt: null,
      OR: [{ welcomeReminderClaimedAt: null }, { welcomeReminderClaimedAt: { lt: staleBefore } }],
    },
    data: { welcomeReminderClaimedAt: new Date() },
  });
  if (claimed.count > 0) return "claimed";
  const latest = await prisma.launchPurchase.findUnique({ where: { id } });
  if (latest?.welcomeReminderSentAt || latest?.bookingId) return "done";
  return "busy";
}

async function claim(
  id: string,
  sentField: "welcomeSentAt" | "adminNotifiedAt",
  claimField: "welcomeClaimedAt" | "notifyClaimedAt"
): Promise<"claimed" | "done" | "busy"> {
  const staleBefore = new Date(Date.now() - CLAIM_STALE_MS);
  const claimed = await prisma.launchPurchase.updateMany({
    where: {
      id,
      [sentField]: null,
      OR: [{ [claimField]: null }, { [claimField]: { lt: staleBefore } }],
    },
    data: { [claimField]: new Date() },
  });
  if (claimed.count > 0) return "claimed";
  const latest = await prisma.launchPurchase.findUnique({ where: { id } });
  if (latest?.[sentField]) return "done";
  return "busy";
}

async function deliverLaunchWelcome(purchase: {
  buyerName: string | null;
  buyerEmail: string | null;
  tier: string;
  amountTotal: number | null;
  currency: string;
  bookingToken: string;
}) {
  if (!purchase.buyerEmail) {
    throw new Error("Launch purchase has no buyer email");
  }
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");

  const welcome = await renderLaunchWelcome({
    buyerName: purchase.buyerName || "",
    tier: purchase.tier,
    amountDisplay: formatPurchaseAmount(purchase.amountTotal, purchase.currency),
    intakeFormUrl: getIntakeFormUrl(),
    schedulingUrl: launchSetupUrl(purchase.bookingToken),
  });

  const resend = new Resend(resendKey);
  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: purchase.buyerEmail,
    replyTo: getEmailReplyTo(),
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });
  if (result.error) {
    throw new Error(result.error.message || "Resend rejected the launch welcome email");
  }
}

async function deliverLaunchReminder(purchase: {
  buyerName: string | null;
  buyerEmail: string | null;
  bookingToken: string;
}) {
  if (!purchase.buyerEmail) throw new Error("Launch purchase has no buyer email");
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");

  const reminder = await renderLaunchSetupReminder({
    buyerName: purchase.buyerName || "",
    schedulingUrl: launchSetupUrl(purchase.bookingToken),
  });
  const resend = new Resend(resendKey);
  const result = await resend.emails.send({
    from: getEmailFrom(),
    to: purchase.buyerEmail,
    replyTo: getEmailReplyTo(),
    subject: reminder.subject,
    html: reminder.html,
    text: reminder.text,
  });
  if (result.error) {
    throw new Error(result.error.message || "Resend rejected the launch reminder email");
  }
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
  welcomeDelivery: LaunchWelcomeDelivery;
  intakeConfigured: boolean;
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
    welcomeDelivery: input.welcomeDelivery,
    intakeConfigured: input.intakeConfigured,
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
