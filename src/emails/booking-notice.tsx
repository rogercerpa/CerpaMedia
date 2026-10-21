import type { BookingKind } from "@/lib/launch-booking-shared";
import { displayValue, intakeLines, multiline, oneLine, previewText } from "./format";
import { DetailBox, EmailLayout, Field, Paragraph, ReplyButton, Subheading, TextBlock } from "./layout";
import { MONO, textStyle } from "./theme";

export interface BookingNoticeProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  formattedStartTime: string;
  platformPref: string;
  serviceLabel: string;
  bookingId: string;
  notes?: string | null;
  intakeAnswers?: unknown;
  consultBrief: string;
  kind?: BookingKind;
  durationLabel?: string;
}

export function BookingNoticeEmail({
  customerName,
  customerEmail,
  customerPhone,
  customerCompany,
  formattedStartTime,
  platformPref,
  serviceLabel,
  bookingId,
  notes,
  intakeAnswers,
  consultBrief,
  kind = "strategy_call",
  durationLabel,
}: BookingNoticeProps) {
  const name = oneLine(customerName) || "sender";
  const phone = customerPhone ? oneLine(customerPhone) : "";
  const platform = oneLine(platformPref);
  const extra = intakeLines(intakeAnswers);
  const duration = oneLine(durationLabel || "") || (kind === "launch_setup" ? "90 minutes" : "30-45 minutes");
  const inPerson = platform.toLowerCase().startsWith("in person");
  const title = kind === "launch_setup"
    ? "New AI Teammate Launch Setup Session"
    : "New Technology Strategy Call Booking";
  const action = inPerson
    ? "Action Required: Confirm the meeting place in the Woodstock, GA area with the customer by email or phone before the session. Do not text."
    : kind === "launch_setup"
      ? `Action Required: Send the ${platform} meeting link to the customer before the setup session. Do not text.`
      : `Action Required: Send ${platform} meeting link to the customer before the scheduled time.`;

  return (
    <EmailLayout
      preview={previewText(kind === "launch_setup" ? `New Launch setup from ${name}` : `New booking from ${name}`)}
      eyebrow="Internal notice"
      title={title}
    >
      <ReplyButton name={name} email={customerEmail} />
      <Subheading>Customer Information</Subheading>
      <Field label="Name" value={name} />
      <Field label="Email" value={oneLine(customerEmail) || customerEmail.trim()} />
      {phone ? <Field label="Phone" value={phone} /> : null}
      <Field label="Company" value={displayValue(customerCompany, "Not provided")} />

      <Subheading>Session Details</Subheading>
      <Field label="Date & time" value={oneLine(formattedStartTime)} />
      <Field label="Duration" value={duration} />
      <Field label="Platform preference" value={platform} />
      <Field label="Service interest" value={displayValue(serviceLabel, "Not specified")} />
      <Field label="Booking ID" value={oneLine(bookingId)} />

      <Subheading>Challenge / Problem Statement</Subheading>
      <Field label="Message" value={multiline(notes, "(not provided)")} />

      {extra.length > 0 ? (
        <>
          <Subheading>Additional Context</Subheading>
          {extra.map((entry) => (
            <Field key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </>
      ) : null}

      <Subheading>For Consult Secretary Bot</Subheading>
      <DetailBox>
        <TextBlock
          text={consultBrief}
          style={textStyle({
            fontFamily: MONO,
            fontSize: "12px",
            lineHeight: "18px",
          })}
        />
      </DetailBox>

      <DetailBox>
        <Paragraph>
          <strong>{action}</strong>
        </Paragraph>
      </DetailBox>
    </EmailLayout>
  );
}
