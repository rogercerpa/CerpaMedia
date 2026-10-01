import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import Stripe from "stripe";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-09-30.endive",
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      serviceInterest,
      notes,
      platformPref,
      intakeAnswers,
    } = body;

    if (!startTime || !endTime || !customerName || !customerEmail || !customerPhone || !customerCompany || !serviceInterest || !platformPref) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!notes || notes.trim().length < 40 || notes.trim().length > 500) {
      return NextResponse.json(
        { error: "Challenge description must be between 40 and 500 characters" },
        { status: 400 }
      );
    }

    const validServiceInterests = ["general", "web_mobile", "ai", "automation", "strategy", "not_sure"];
    if (!validServiceInterests.includes(serviceInterest)) {
      return NextResponse.json(
        { error: "Invalid service interest" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const available = await isSlotAvailable(start, end);
    if (!available) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        startTime: start,
        endTime: end,
        status: "pending",
        customerName,
        customerEmail,
        customerPhone,
        customerCompany,
        serviceInterest,
        platformPref,
        notes: notes.trim(),
        intakeAnswers: intakeAnswers || {},
        holdExpiresAt,
      },
    });

    const priceId = process.env.STRIPE_PRICE_ID;
    
    let sessionParams: Stripe.Checkout.SessionCreateParams;
    
    if (priceId) {
      sessionParams = {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${BASE_URL}/consult/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/consult/cancel`,
        customer_email: customerEmail,
        metadata: {
          bookingId: booking.id,
        },
      };
    } else {
      sessionParams = {
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Technology Strategy Call",
                description: "30-45 minute expert technology consultation",
              },
              unit_amount: 9900,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${BASE_URL}/consult/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/consult/cancel`,
        customer_email: customerEmail,
        metadata: {
          bookingId: booking.id,
        },
      };
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(sessionParams);

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
