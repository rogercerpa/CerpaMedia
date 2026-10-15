import { displayValue, multiline, oneLine, previewText } from "./format";
import { EmailLayout, Field, ReplyButton } from "./layout";

export interface ContactNoticeProps {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
  receivedAt: string;
}

export function ContactNoticeEmail({
  name,
  email,
  phone,
  company,
  service,
  message,
  receivedAt,
}: ContactNoticeProps) {
  const displayName = oneLine(name) || "sender";
  const phoneValue = phone ? oneLine(phone) : "";

  return (
    <EmailLayout
      preview={previewText(`New contact form submission from ${displayName}`)}
      eyebrow="Internal notice"
      title="New Contact Form Submission"
    >
      <ReplyButton name={displayName} email={email} />
      <Field label="Name" value={displayName} />
      <Field label="Email" value={oneLine(email) || email.trim()} />
      {phoneValue ? <Field label="Phone" value={phoneValue} /> : null}
      <Field label="Company" value={displayValue(company, "Not provided")} />
      <Field label="Service interest" value={displayValue(service, "Not specified")} />
      <Field label="Message" value={multiline(message, "(not provided)")} />
      <Field label="Received" value={receivedAt} />
    </EmailLayout>
  );
}
