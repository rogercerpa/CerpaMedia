import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import { isMissingRelationError, isUniqueConflict } from "@/lib/db-errors";
import { getLaunchSetupLengthMin } from "@/lib/launch-booking";
import {
  LAUNCH_SETUP_LABEL,
  LAUNCH_SETUP_SERVICE,
  durationMinutesLabel,
  isLaunchSetupPlatform,
  isPlausibleBookingToken,
} from "@/lib/launch-booking-shared";
import { sendBookingEmails } from "@/lib/send-booking-emails";
import {
  checkHoneypot,
  checkRateLimit,
  emailLooksGenerated,
  looksLikeSpam,
  validateEmail,
  validatePhone,
  validateTextInput,
} from "@/lib/security";

export const dynamic = "force-dynamic";

class BookingRejected extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      notes,
      platformPref,
      website,
    } = body ?? {};

    if (!checkHoneypot(website)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!isPlausibleBookingToken(String(token || ""))) {
      return NextResponse.json(
        { error: "This scheduling link is not valid." },
        { status: 404 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const rateLimit = checkRateLimit({
      identifier: `launch-setup:${ip}`,
      maxRequests: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!startTime || !endTime || !customerName || !customerEmail || !platformPref) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isLaunchSetupPlatform(String(platformPref))) {
      return NextResponse.json(
        { error: "Choose Zoom, Microsoft Teams, or in person in the Woodstock, GA area." },
        { status: 400 }
      );
    }

    if (looksLikeSpam(customerName) || emailLooksGenerated(customerEmail)) {
      return NextResponse.json({ error: "Please enter a valid name and email" }, { status: 400 });
    }

    const nameValidation = validateTextInput({
      value: customerName,
      minLength: 2,
      maxLength: 100,
      fieldName: "Name",
      required: true,
    });
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const email = String(customerEmail).trim().slice(0, 254);
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const phone = customerPhone ? String(customerPhone).trim().slice(0, 20) : "";
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    let company = "Not provided";
    if (customerCompany && String(customerCompany).trim()) {
      const companyValidation = validateTextInput({
        value: customerCompany,
        minLength: 1,
        maxLength: 200,
        fieldName: "Company",
        required: true,
      });
      if (!companyValidation.valid) {
        return NextResponse.json({ error: companyValidation.error }, { status: 400 });
      }
      company = companyValidation.sanitized;
    }

    let sanitizedNotes: string | null = null;
    if (notes && String(notes).trim()) {
      if (looksLikeSpam(String(notes))) {
        return NextResponse.json(
          { error: "Please enter a clear note for Roger" },
          { status: 400 }
        );
      }
      const notesValidation = validateTextInput({
        value: notes,
        maxLength: 500,
        fieldName: "Notes",
        required: false,
      });
      if (!notesValidation.valid) {
        return NextResponse.json({ error: notesValidation.error }, { status: 400 });
      }
      sanitizedNotes = notesValidation.sanitized || null;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    let purchase;
    try {
      purchase = await prisma.launchPurchase.findUnique({
        where: { bookingToken: String(token) },
      });
    } catch (error) {
      if (isMissingRelationError(error)) {
        return NextResponse.json(
          { error: "Scheduling is not available yet." },
          { status: 503 }
        );
      }
      throw error;
    }

    if (!purchase) {
      return NextResponse.json(
        { error: "This scheduling link is not valid." },
        { status: 404 }
      );
    }
    if (purchase.bookingId) {
      return NextResponse.json(
        { error: "This setup session is already scheduled." },
        { status: 409 }
      );
    }

    if (purchase.buyerEmail && purchase.buyerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Use the email address from your purchase." },
        { status: 400 }
      );
    }

    const lengthMin = await getLaunchSetupLengthMin();
    const windowStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    const slots = await getAvailableSlots(windowStart, windowEnd, { slotLengthMin: lengthMin });
    const matches = slots.some(
      (slot) => slot.start.getTime() === start.getTime() && slot.end.getTime() === end.getTime()
    );
    if (!matches) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      const overlap = await tx.booking.findFirst({
        where: {
          status: "confirmed",
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });
      if (overlap) {
        throw new BookingRejected("This time slot is no longer available", 409);
      }

      const created = await tx.booking.create({
        data: {
          startTime: start,
          endTime: end,
          status: "confirmed",
          customerName: nameValidation.sanitized,
          customerEmail: email,
          customerPhone: phone,
          customerCompany: company,
          serviceInterest: LAUNCH_SETUP_SERVICE,
          platformPref,
          notes: sanitizedNotes,
          intakeAnswers: {
            bookingType: LAUNCH_SETUP_LABEL,
            tier: purchase.tier,
            launchPurchaseId: purchase.id,
          },
        },
      });

      const claim = await tx.launchPurchase.updateMany({
        where: { id: purchase.id, bookingId: null },
        data: { bookingId: created.id },
      });
      if (claim.count === 0) {
        await tx.booking.delete({ where: { id: created.id } });
        throw new BookingRejected("This setup session is already scheduled.", 409);
      }

      return created;
    });

    await sendBookingEmails(booking, {
      kind: "launch_setup",
      durationLabel: durationMinutesLabel(lengthMin),
    });

    return NextResponse.json({
      confirmed: true,
      bookingId: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      platformPref: booking.platformPref,
      durationMinutes: lengthMin,
    });
  } catch (error) {
    if (error instanceof BookingRejected) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (isUniqueConflict(error)) {
      return NextResponse.json(
        { error: "This setup session is already scheduled." },
        { status: 409 }
      );
    }
    console.error("Error confirming launch setup session:", error);
    return NextResponse.json(
      { error: "Failed to confirm the setup session" },
      { status: 500 }
    );
  }
}
