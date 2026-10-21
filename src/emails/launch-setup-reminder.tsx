import { firstNameFrom, oneLine } from "./format";
import { LAUNCH_INTAKE_BUTTON, LAUNCH_WELCOME_CLOSING } from "./launch-welcome";
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
      preview="Your intake and setup session are still open."
      title="Your setup session is still open"
    >
      <Paragraph>{`Hi ${name},`}</Paragraph>
      <Paragraph>
        Your AI Teammate Launch is paid. If you haven&apos;t filled out your intake and picked a setup time, you can still do that from the same private link.
      </Paragraph>
      {href ? <PrimaryButton href={href} label={LAUNCH_INTAKE_BUTTON} /> : null}
      <Paragraph>Roger will review your intake before the session.</Paragraph>
      <Paragraph>{LAUNCH_WELCOME_CLOSING}</Paragraph>
    </EmailLayout>
  );
}
