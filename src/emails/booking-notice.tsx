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
}: BookingNoticeProps) {
  const name = oneLine(customerName) || "sender";
  const phone = customerPhone ? oneLine(customerPhone) : "";
  const platform = oneLine(platformPref);
  const extra = intakeLines(intakeAnswers);

  return (
    <EmailLayout
      preview={previewText(`New booking from ${name}`)}
      eyebrow="Internal notice"
      title="New Technology Strategy Call Booking"
    >
      <ReplyButton name={name} email={customerEmail} />
      <Subheading>Customer Information</Subheading>
      <Field label="Name" value={name} />
      <Field label="Email" value={oneLine(customerEmail) || customerEmail.trim()} />
      {phone ? <Field label="Phone" value={phone} /> : null}
      <Field label="Company" value={displayValue(customerCompany, "Not provided")} />

      <Subheading>Session Details</Subheading>
      <Field label="Date & time" value={oneLine(formattedStartTime)} />
      <Field label="Duration" value="30-45 minutes" />
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
          <strong>
            {`Action Required: Send ${platform} meeting link to the customer before the scheduled time.`}
          </strong>
        </Paragraph>
      </DetailBox>
    </EmailLayout>
  );
}
