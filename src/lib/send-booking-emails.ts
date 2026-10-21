import { Resend } from "resend";
import { formatEasternTimestamp } from "@/emails/format";
import { createBookingEmails } from "@/emails/messages";
import { formatConsultBriefForAdmin, toConsultBrief } from "@/lib/consult-brief";
import { getEmailFrom } from "@/lib/email";
import {
  LAUNCH_SETUP_LABEL,
  LAUNCH_SETUP_SERVICE,
  type BookingKind,
} from "@/lib/launch-booking-shared";
import type { Booking } from "@prisma/client";

const SERVICE_LABELS: Record<string, string> = {
  general: "Technology Strategy Call (general)",
  web_mobile: "Web & mobile applications",
  ai: "AI integration / AI consulting",
  automation: "Automation & process improvement",
  strategy: "Strategy / architecture / roadmap",
  not_sure: "Not sure yet",
  [LAUNCH_SETUP_SERVICE]: LAUNCH_SETUP_LABEL,
};

export async function sendBookingEmails(
  booking: Booking,
  options?: { kind?: BookingKind; durationLabel?: string }
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured, skipping emails");
    return;
  }

  const resend = new Resend(resendKey);
  const fromEmail = getEmailFrom();
  const adminEmail = process.env.CONTACT_TO_EMAIL || "cerpamedia@gmail.com";
  const kind: BookingKind =
    options?.kind || (booking.serviceInterest === LAUNCH_SETUP_SERVICE ? "launch_setup" : "strategy_call");
  const consultBrief = toConsultBrief(booking, kind === "launch_setup" ? "included" : "confirmed");

  console.log("[Consult Secretary Hook] Booking confirmed:", JSON.stringify(consultBrief, null, 2));

  try {
    const messages = await createBookingEmails({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerCompany: booking.customerCompany,
      formattedStartTime: formatEasternTimestamp(booking.startTime),
      platformPref: booking.platformPref,
      serviceLabel: SERVICE_LABELS[booking.serviceInterest] || booking.serviceInterest,
      bookingId: booking.id,
      notes: booking.notes,
      intakeAnswers: booking.intakeAnswers,
      consultBrief: formatConsultBriefForAdmin(consultBrief),
      adminEmail,
      kind,
      durationLabel: options?.durationLabel,
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
