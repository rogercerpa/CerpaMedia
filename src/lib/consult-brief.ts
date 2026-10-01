import { Booking } from "@prisma/client";

export interface ConsultBrief {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  serviceInterest: string;
  serviceInterestLabel: string;
  challenge: string | null;
  platform: string;
  slotStart: string;
  slotEnd: string;
  timezone: string;
  intakeAnswers: Record<string, any> | null;
  paymentStatus: string;
}

const SERVICE_LABELS: Record<string, string> = {
  general: "Technology Strategy Call (general)",
  web_mobile: "Web & mobile applications",
  ai: "AI integration / AI consulting",
  automation: "Automation & process improvement",
  strategy: "Strategy / architecture / roadmap",
  not_sure: "Not sure yet",
};

export function toConsultBrief(
  booking: Booking,
  paymentStatus: string = "confirmed"
): ConsultBrief {
  return {
    bookingId: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    customerCompany: booking.customerCompany,
    serviceInterest: booking.serviceInterest,
    serviceInterestLabel:
      SERVICE_LABELS[booking.serviceInterest] || booking.serviceInterest,
    challenge: booking.notes,
    platform: booking.platformPref,
    slotStart: booking.startTime.toISOString(),
    slotEnd: booking.endTime.toISOString(),
    timezone: "America/New_York",
    intakeAnswers: booking.intakeAnswers as Record<string, any> | null,
    paymentStatus,
  };
}

export function formatConsultBriefForAdmin(brief: ConsultBrief): string {
  const startTime = new Date(brief.slotStart).toLocaleString("en-US", {
    timeZone: brief.timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  let text = `=== Technology Strategy Call Brief ===

Customer: ${brief.customerName}
Company: ${brief.customerCompany}
Email: ${brief.customerEmail}
Phone: ${brief.customerPhone}

Service Interest: ${brief.serviceInterestLabel}

Scheduled: ${startTime}
Platform: ${brief.platform}
Booking ID: ${brief.bookingId}
Payment: ${brief.paymentStatus}

Challenge:
${brief.challenge || "(not provided)"}
`;

  if (brief.intakeAnswers && Object.keys(brief.intakeAnswers).length > 0) {
    text += "\nContextual Answers:\n";
    Object.entries(brief.intakeAnswers).forEach(([key, value]) => {
      if (value) {
        text += `  ${key}: ${value}\n`;
      }
    });
  }

  return text;
}
