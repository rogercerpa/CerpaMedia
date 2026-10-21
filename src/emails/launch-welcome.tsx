import { firstNameFrom, oneLine } from "./format";
import { EmailLayout, Paragraph, PrimaryButton, Subheading } from "./layout";

export const LAUNCH_WELCOME_SUBJECT = "You're in — next steps for your AI Teammate Launch";
export const LAUNCH_WELCOME_CLOSING = "Reply to this email or call (943) 248-7410.";

export interface LaunchWelcomeProps {
  buyerName: string;
  tier: string;
  amountDisplay: string;
  intakeFormUrl: string | null;
  schedulingUrl: string;
}

export function LaunchWelcomeEmail({
  buyerName,
  tier,
  amountDisplay,
  intakeFormUrl,
  schedulingUrl,
}: LaunchWelcomeProps) {
  const name = firstNameFrom(buyerName);
  const plan = oneLine(tier) || "regular";
  const amount = oneLine(amountDisplay);
  const showAmount = amount.length > 0 && amount.toLowerCase() !== "unknown";
  const intake = safeHttpUrl(intakeFormUrl);
  const scheduling = safeHttpUrl(schedulingUrl);

  return (
    <EmailLayout
      preview="You're in. Fill out a short intake, then pick a time for your setup session."
      title="You're in"
    >
      <Paragraph>{`Hi ${name},`}</Paragraph>
      <Paragraph>
        {showAmount
          ? `Thank you for purchasing the AI Teammate Launch. You're in on the ${plan} plan, and we received ${amount}.`
          : `Thank you for purchasing the AI Teammate Launch. You're in on the ${plan} plan.`}
      </Paragraph>

      {intake ? (
        <>
          <Subheading>Step 1. Intake form</Subheading>
          <Paragraph>This takes about 15 minutes.</Paragraph>
          <PrimaryButton href={intake} label="Fill out the intake form" />
        </>
      ) : null}

      <Subheading>{intake ? "Step 2. Setup session" : "Setup session"}</Subheading>
      <Paragraph>Pick a date and time for your setup session.</Paragraph>
      {scheduling ? (
        <PrimaryButton href={scheduling} label="Choose a date and time" />
      ) : null}

      <Paragraph>Roger will review your intake before the session.</Paragraph>
      <Paragraph>{LAUNCH_WELCOME_CLOSING}</Paragraph>
    </EmailLayout>
  );
}

function safeHttpUrl(value: string | null): string | null {
  const cleaned = oneLine(value || "");
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
