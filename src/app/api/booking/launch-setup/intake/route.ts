import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMissingRelationError } from "@/lib/db-errors";
import { isPlausibleBookingToken } from "@/lib/launch-booking-shared";
import { clientReferenceFor, reviewIntake } from "@/lib/launch-intake";
import { checkHoneypot, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, answers, submit, sectionId, website } = body ?? {};

    if (!checkHoneypot(website)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!isPlausibleBookingToken(String(token || ""))) {
      return NextResponse.json({ error: "This scheduling link is not valid." }, { status: 404 });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const rateLimit = checkRateLimit({
      identifier: `launch-intake:${String(token)}:${ip}`,
      maxRequests: 40,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many saves. Please wait a little and try again." },
        { status: 429 }
      );
    }

    let purchase;
    try {
      purchase = await prisma.launchPurchase.findUnique({
        where: { bookingToken: String(token) },
        select: {
          id: true,
          createdAt: true,
          buyerEmail: true,
          bookingId: true,
        },
      });
    } catch (error) {
      if (isMissingRelationError(error)) {
        return NextResponse.json({ error: "Scheduling is not available yet." }, { status: 503 });
      }
      throw error;
    }

    if (!purchase) {
      return NextResponse.json({ error: "This scheduling link is not valid." }, { status: 404 });
    }
    if (purchase.bookingId) {
      return NextResponse.json(
        { error: "This setup session is already scheduled." },
        { status: 409 }
      );
    }

    const mode = submit === true ? "submit" : sectionId ? "section" : "draft";
    const review = reviewIntake({
      answers,
      mode,
      sectionId: typeof sectionId === "string" ? sectionId : undefined,
      clientReference: clientReferenceFor(purchase),
      buyerEmail: purchase.buyerEmail,
    });

    if (Object.keys(review.errors).length > 0) {
      return NextResponse.json(
        { error: "Please check the highlighted questions.", fields: review.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.launchIntake.findUnique({
      where: { purchaseId: purchase.id },
      select: { submittedAt: true },
    });
    const submittedAt = submit === true ? existing?.submittedAt ?? new Date() : existing?.submittedAt ?? null;

    const saved = await prisma.launchIntake.upsert({
      where: { purchaseId: purchase.id },
      create: {
        purchaseId: purchase.id,
        answers: review.answers,
        submittedAt: submit === true ? new Date() : null,
      },
      update: {
        answers: review.answers,
        ...(submit === true && !existing?.submittedAt ? { submittedAt: new Date() } : {}),
      },
      select: { answers: true, submittedAt: true },
    });

    return NextResponse.json({
      ok: true,
      submitted: Boolean(saved.submittedAt || submittedAt),
      answers: review.answers,
    });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json({ error: "Scheduling is not available yet." }, { status: 503 });
    }
    console.error("Error saving launch intake:", error);
    return NextResponse.json({ error: "Could not save your answers." }, { status: 500 });
  }
}
