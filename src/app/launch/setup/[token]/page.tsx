import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LaunchSetupExperience } from "@/components/LaunchSetupExperience";
import { formatEasternTimestamp } from "@/emails/format";
import { prisma } from "@/lib/prisma";
import { isMissingRelationError } from "@/lib/db-errors";
import { getLaunchSetupLengthMin } from "@/lib/launch-booking";
import {
  LAUNCH_SETUP_LABEL,
  isPlausibleBookingToken,
} from "@/lib/launch-booking-shared";
import { asIntakeAnswers, clientReferenceFor, LAUNCH_INTAKE_CONFIRMATION } from "@/lib/launch-intake";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule your setup session",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function LaunchSetupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isPlausibleBookingToken(token)) notFound();

  let purchase: {
    id: string;
    createdAt: Date;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;
    tier: string;
    booking: {
      startTime: Date;
      endTime: Date;
      platformPref: string;
      status: string;
    } | null;
    intake: {
      answers: unknown;
      submittedAt: Date | null;
    } | null;
  } | null;

  try {
    purchase = await prisma.launchPurchase.findUnique({
      where: { bookingToken: token },
      select: {
        id: true,
        createdAt: true,
        buyerName: true,
        buyerEmail: true,
        buyerPhone: true,
        tier: true,
        booking: {
          select: {
            startTime: true,
            endTime: true,
            platformPref: true,
            status: true,
          },
        },
        intake: {
          select: {
            answers: true,
            submittedAt: true,
          },
        },
      },
    });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return <SchedulingUnavailable />;
    }
    throw error;
  }

  if (!purchase) notFound();

  const duration = await getLaunchSetupLengthMin();
  const firstName = purchase.buyerName?.trim().split(/\s+/)[0];
  const alreadyBooked = purchase.booking && purchase.booking.status !== "cancelled";

  return (
    <div>
      <section className="bg-bg py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block border border-border px-3 py-1 mb-6">
            <span className="text-[11px] font-medium text-text uppercase tracking-wider">
              Private scheduling link
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-text tracking-tight leading-tight">
            {alreadyBooked ? LAUNCH_SETUP_LABEL : "AI Teammate Launch: Intake"}
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {firstName ? `${firstName}, your` : "Your"} {purchase.tier} purchase is already paid.
            {alreadyBooked
              ? " Your setup session is on the calendar."
              : " Fill out a short intake, then pick a setup time."}
          </p>
          <p className="text-[15px] text-text-muted mt-4 max-w-2xl mx-auto leading-relaxed">
            Your setup session can be on Zoom, Microsoft Teams, or in person in the Woodstock, GA area.
          </p>
        </div>
      </section>

      <section className="py-10 border-t border-border bg-bg-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {alreadyBooked && purchase.booking ? (
            <AlreadyBooked
              startTime={purchase.booking.startTime}
              platformPref={purchase.booking.platformPref}
              duration={duration}
            />
          ) : (
            <LaunchSetupExperience
              token={token}
              durationMinutes={duration}
              clientReference={clientReferenceFor(purchase)}
              buyerEmail={purchase.buyerEmail}
              buyerName={purchase.buyerName}
              buyerPhone={purchase.buyerPhone}
              initialAnswers={asIntakeAnswers(purchase.intake?.answers)}
              intakeSubmitted={Boolean(purchase.intake?.submittedAt)}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function AlreadyBooked({
  startTime,
  platformPref,
  duration,
}: {
  startTime: Date;
  platformPref: string;
  duration: number;
}) {
  return (
    <div className="max-w-2xl mx-auto border border-border bg-white p-6 sm:p-8 text-center">
      <h2 className="text-2xl font-semibold text-text mb-3">You&apos;re booked</h2>
      <p className="text-text mb-2">{formatEasternTimestamp(startTime)}</p>
      <p className="text-text-muted mb-2">{duration} minutes · {platformPref}</p>
      <p className="text-[15px] text-text leading-relaxed mt-4">{LAUNCH_INTAKE_CONFIRMATION}</p>
      <p className="text-[15px] text-text-muted leading-relaxed mt-4">
        Roger will email you the meeting details. To reschedule, email{" "}
        <a className="text-text underline" href="mailto:cerpamedia@gmail.com">
          cerpamedia@gmail.com
        </a>{" "}
        or call. We email or call; we don&apos;t text.
      </p>
    </div>
  );
}

function SchedulingUnavailable() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-text mb-4">Scheduling isn&apos;t available yet</h1>
      <p className="text-text-muted">
        Email{" "}
        <a className="text-text underline" href="mailto:cerpamedia@gmail.com">
          cerpamedia@gmail.com
        </a>{" "}
        and Roger will schedule your setup session.
      </p>
    </div>
  );
}
