import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Step 1: Create CheckoutHold
    let hold;
    try {
      hold = await prisma.checkoutHold.create({
        data: {
          startTime: start,
          endTime: end,
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
          serviceInterest,
          platformPref,
          notes: notes.trim(),
          intakeAnswers: intakeAnswers || {},
          expiresAt,
        },
      });
    } catch (error) {
      const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
      console.error("[CHECKOUT_HOLD_CREATE_FAILED]", {
        code: "CHECKOUT_HOLD_CREATE_FAILED",
        prismaCode,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          error: "Failed to create checkout hold",
          code: "CHECKOUT_HOLD_CREATE_FAILED",
          prismaCode,
          hint: prismaCode === "P2021" 
            ? "CheckoutHold table does not exist - run 'prisma db push' to sync schema"
            : "Database error while creating hold",
        },
        { status: 500 }
      );
    }

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
          holdId: hold.id,
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
          holdId: hold.id,
        },
      };
    }

    // Step 2: Create Stripe session
    let session;
    try {
      const stripe = getStripeClient();
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (error) {
      console.error("[CHECKOUT_STRIPE_FAILED]", {
        code: "CHECKOUT_STRIPE_FAILED",
        holdId: hold.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          error: "Failed to create Stripe checkout session",
          code: "CHECKOUT_STRIPE_FAILED",
          hint: error instanceof Error && error.message.includes("API key")
            ? "Stripe API key not configured or invalid"
            : error instanceof Error && error.message.includes("price")
            ? "Stripe price configuration error"
            : "Stripe API error - check configuration",
        },
        { status: 500 }
      );
    }

    // Step 3: Update CheckoutHold with Stripe session ID
    try {
      await prisma.checkoutHold.update({
        where: { id: hold.id },
        data: { stripeSessionId: session.id },
      });
    } catch (error) {
      const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
      console.error("[CHECKOUT_HOLD_UPDATE_FAILED]", {
        code: "CHECKOUT_HOLD_UPDATE_FAILED",
        prismaCode,
        holdId: hold.id,
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          error: "Failed to update checkout hold with session ID",
          code: "CHECKOUT_HOLD_UPDATE_FAILED",
          prismaCode,
          hint: "Hold created and Stripe session created, but failed to link them",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[CHECKOUT_FAILED]", {
      code: "CHECKOUT_FAILED",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        code: "CHECKOUT_FAILED",
        hint: "Unexpected error - check server logs",
      },
      { status: 500 }
    );
  }
}
