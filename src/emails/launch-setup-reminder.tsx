import { firstNameFrom, oneLine } from "./format";
import { LAUNCH_WELCOME_CLOSING } from "./launch-welcome";
import { EmailLayout, Paragraph, PrimaryButton } from "./layout";

export const LAUNCH_REMINDER_SUBJECT = "Your AI Teammate Launch setup session is still open";

export interface LaunchSetupReminderProps {
  buyerName: string;
  schedulingUrl: string;
}

export function LaunchSetupReminderEmail({
  buyerName,
  schedulingUrl,
}: LaunchSetupReminderProps) {
  const name = firstNameFrom(buyerName);
  const scheduling = oneLine(schedulingUrl);
  const href = scheduling.startsWith("https://") || scheduling.startsWith("http://") ? scheduling : "";

  return (
    <EmailLayout
      preview="Your setup session is still open. Pick a time whenever you're ready."
      title="Your setup session is still open"
    >
      <Paragraph>{`Hi ${name},`}</Paragraph>
      <Paragraph>
        Your AI Teammate Launch is paid. The setup session is still open whenever you&apos;re ready. It takes a couple of minutes to pick a time.
      </Paragraph>
      {href ? <PrimaryButton href={href} label="Choose a date and time" /> : null}
      <Paragraph>Roger will review your intake before the session.</Paragraph>
      <Paragraph>{LAUNCH_WELCOME_CLOSING}</Paragraph>
    </EmailLayout>
  );
}
