import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { isLaunchCheckout } from "@/lib/launch-checkout";
import { notifyLaunchPurchase } from "@/lib/launch-purchase";
import { sendBookingEmails } from "@/lib/send-booking-emails";

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

    if (isLaunchCheckout(session)) {
      try {
        await notifyLaunchPurchase(session, event.id);
      } catch (error) {
        console.error("Launch purchase webhook failed:", session.id, error);
        return NextResponse.json(
          { error: "Failed to process webhook" },
          { status: 500 }
        );
      }
      return NextResponse.json({ received: true });
    }

    const holdId = session.metadata?.holdId;

    if (!holdId) {
      console.info("Ignoring checkout.session.completed without a booking hold:", session.id);
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

      await sendBookingEmails(booking);
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
