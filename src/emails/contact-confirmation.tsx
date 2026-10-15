import { firstNameFrom, multiline, oneLine } from "./format";
import { EmailLayout, Field, Paragraph } from "./layout";

export interface ContactConfirmationProps {
  name: string;
  email: string;
  company?: string | null;
  service?: string | null;
  message: string;
}

export function ContactConfirmationEmail({
  name,
  email,
  company,
  service,
  message,
}: ContactConfirmationProps) {
  const greetingName = firstNameFrom(name);
  const companyValue = company ? oneLine(company) : "";
  const serviceValue = service ? oneLine(service) : "";

  return (
    <EmailLayout
      preview="Roger will be in touch within 1 business day."
      title={`We got your message, ${greetingName}`}
    >
      <Paragraph>{`Hi ${greetingName},`}</Paragraph>
      <Paragraph>
        Thank you for your message. Roger will be in touch within 1 business day by email or phone.
      </Paragraph>
      <Paragraph>Here&apos;s a copy of what you sent:</Paragraph>
      <Field label="Name" value={oneLine(name) || greetingName} />
      <Field label="Email" value={oneLine(email) || email.trim()} />
      {companyValue ? <Field label="Company" value={companyValue} /> : null}
      {serviceValue ? <Field label="Service" value={serviceValue} /> : null}
      <Field label="Message" value={multiline(message, "(not provided)")} />
      <Paragraph>Roger Cerpa, CerpaMedia</Paragraph>
    </EmailLayout>
  );
}
