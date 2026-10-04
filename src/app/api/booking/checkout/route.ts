import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import Stripe from "stripe";
import {
  checkRateLimit,
  validateTextInput,
  validateEmail,
  validatePhone,
  checkHoneypot,
  looksLikeSpam,
  emailLooksGenerated,
} from "@/lib/security";

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
      website,
    } = body;

    if (!checkHoneypot(website)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime || !customerName || !customerEmail || !customerPhone || !customerCompany || !serviceInterest || !platformPref) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (looksLikeSpam(customerName)) {
      return NextResponse.json(
        { error: "Please enter a valid name" },
        { status: 400 }
      );
    }

    if (emailLooksGenerated(customerEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (notes && looksLikeSpam(notes)) {
      return NextResponse.json(
        { error: "Please enter a clear description of your challenge" },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const rateLimit = checkRateLimit({
      identifier: `booking:${ip}`,
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again later." },
        { status: 429 }
      );
    }

    const nameValidation = validateTextInput({
      value: customerName,
      minLength: 2,
      maxLength: 100,
      fieldName: "Name",
      required: true,
    });

    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    if (!validateEmail(customerEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!validatePhone(customerPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    const companyValidation = validateTextInput({
      value: customerCompany,
      minLength: 1,
      maxLength: 200,
      fieldName: "Company",
      required: true,
    });

    if (!companyValidation.valid) {
      return NextResponse.json(
        { error: companyValidation.error },
        { status: 400 }
      );
    }

    const notesValidation = validateTextInput({
      value: notes,
      minLength: 40,
      maxLength: 500,
      fieldName: "Challenge description",
      required: true,
    });

    if (!notesValidation.valid) {
      return NextResponse.json(
        { error: notesValidation.error },
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

    const validPlatforms = ["Zoom", "Microsoft Teams"];
    if (!validPlatforms.includes(platformPref)) {
      return NextResponse.json(
        { error: "Invalid platform preference" },
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

    const sanitizedIntakeAnswers: Record<string, string> = {};
    if (intakeAnswers && typeof intakeAnswers === "object") {
      for (const [key, value] of Object.entries(intakeAnswers)) {
        if (typeof value === "string" && key.length <= 100) {
          const validation = validateTextInput({
            value,
            maxLength: 500,
            fieldName: key,
            required: false,
          });
          if (validation.valid && validation.sanitized) {
            sanitizedIntakeAnswers[key] = validation.sanitized;
          }
        }
      }
    }

    const hold = await prisma.checkoutHold.create({
      data: {
        startTime: start,
        endTime: end,
        customerName: nameValidation.sanitized,
        customerEmail: customerEmail.trim().slice(0, 254),
        customerPhone: customerPhone.trim().slice(0, 20),
        customerCompany: companyValidation.sanitized,
        serviceInterest,
        platformPref,
        notes: notesValidation.sanitized,
        intakeAnswers: sanitizedIntakeAnswers,
        expiresAt,
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

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(sessionParams);

    await prisma.checkoutHold.update({
      where: { id: hold.id },
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
