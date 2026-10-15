import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { Resend } from "resend";
import { formatEasternTimestamp } from "@/emails/format";
import { createBookingEmails } from "@/emails/messages";
import { toConsultBrief, formatConsultBriefForAdmin } from "@/lib/consult-brief";
import { getEmailFrom } from "@/lib/email";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-09-30.endive",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const holdId = session.metadata?.holdId;

    if (!holdId) {
      console.error("No holdId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const existingBooking = await prisma.booking.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (existingBooking) {
        return NextResponse.json({ received: true });
      }

      const hold = await prisma.checkoutHold.findUnique({
        where: { id: holdId },
      });

      if (!hold) {
        console.error("Hold not found:", holdId);
        return NextResponse.json({ received: true });
      }

      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          status: "confirmed",
          OR: [
            {
              AND: [
                { startTime: { lte: hold.startTime } },
                { endTime: { gt: hold.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: hold.endTime } },
                { endTime: { gte: hold.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: hold.startTime } },
                { endTime: { lte: hold.endTime } },
              ],
            },
          ],
        },
      });

      if (overlappingBooking) {
        console.error("Slot already booked:", holdId, overlappingBooking.id);
        await prisma.checkoutHold.delete({
          where: { id: holdId },
        });
        return NextResponse.json({ received: true });
      }

      const booking = await prisma.booking.create({
        data: {
          startTime: hold.startTime,
          endTime: hold.endTime,
          status: "confirmed",
          customerName: hold.customerName,
          customerEmail: hold.customerEmail,
          customerPhone: hold.customerPhone,
          customerCompany: hold.customerCompany,
          serviceInterest: hold.serviceInterest,
          platformPref: hold.platformPref,
          intakeAnswers: hold.intakeAnswers as any,
          notes: hold.notes,
          stripeSessionId: session.id,
        },
      });

      await prisma.checkoutHold.delete({
        where: { id: holdId },
      });

      const consultBrief = toConsultBrief(booking, "confirmed");
      
      console.log("[Consult Secretary Hook] Booking confirmed:", JSON.stringify(consultBrief, null, 2));

      await sendConfirmationEmails(booking);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function sendConfirmationEmails(booking: any) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured, skipping emails");
    return;
  }
  
  const resend = new Resend(resendKey);
  const fromEmail = getEmailFrom();
  const adminEmail = process.env.CONTACT_TO_EMAIL || "cerpamedia@gmail.com";

  const formattedStartTime = formatEasternTimestamp(booking.startTime);

  const consultBrief = toConsultBrief(booking, "confirmed");
  const serviceLabels: Record<string, string> = {
    general: "Technology Strategy Call (general)",
    web_mobile: "Web & mobile applications",
    ai: "AI integration / AI consulting",
    automation: "Automation & process improvement",
    strategy: "Strategy / architecture / roadmap",
    not_sure: "Not sure yet",
  };
  const serviceLabel = serviceLabels[booking.serviceInterest] || booking.serviceInterest;

  try {
    const messages = await createBookingEmails({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerCompany: booking.customerCompany,
      formattedStartTime,
      platformPref: booking.platformPref,
      serviceLabel,
      bookingId: booking.id,
      notes: booking.notes,
      intakeAnswers: booking.intakeAnswers,
      consultBrief: formatConsultBriefForAdmin(consultBrief),
      adminEmail,
    });

    const customerResult = await resend.emails.send({
      from: fromEmail,
      to: messages.customer.to,
      replyTo: messages.customer.replyTo,
      subject: messages.customer.subject,
      html: messages.customer.html,
      text: messages.customer.text,
    });
    if (customerResult.error) {
      console.error("Error sending confirmation emails:", customerResult.error);
    }

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: messages.admin.to,
      replyTo: messages.admin.replyTo,
      subject: messages.admin.subject,
      html: messages.admin.html,
      text: messages.admin.text,
    });
    if (adminResult.error) {
      console.error("Error sending confirmation emails:", adminResult.error);
    }
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
}
