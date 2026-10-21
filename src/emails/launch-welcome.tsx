import { firstNameFrom, oneLine } from "./format";
import { EmailLayout, Paragraph, PrimaryButton } from "./layout";

export const LAUNCH_WELCOME_SUBJECT = "You're in — next steps for your AI Teammate Launch";
export const LAUNCH_WELCOME_CLOSING = "Reply to this email or call (943) 248-7410.";
export const LAUNCH_INTAKE_BUTTON = "Fill out your intake and pick your setup time";

export interface LaunchWelcomeProps {
  buyerName: string;
  tier: string;
  amountDisplay: string;
  schedulingUrl: string;
}

export function LaunchWelcomeEmail({
  buyerName,
  tier,
  amountDisplay,
  schedulingUrl,
}: LaunchWelcomeProps) {
  const name = firstNameFrom(buyerName);
  const plan = oneLine(tier) || "regular";
  const amount = oneLine(amountDisplay);
  const showAmount = amount.length > 0 && amount.toLowerCase() !== "unknown";
  const scheduling = safeHttpUrl(schedulingUrl);

  return (
    <EmailLayout
      preview="You're in. Fill out your intake and pick a time for your setup session."
      title="You're in"
    >
      <Paragraph>{`Hi ${name},`}</Paragraph>
      <Paragraph>
        {showAmount
          ? `Thank you for purchasing the AI Teammate Launch. You're in on the ${plan} plan, and we received ${amount}.`
          : `Thank you for purchasing the AI Teammate Launch. You're in on the ${plan} plan.`}
      </Paragraph>
      <Paragraph>
        This takes about 15 minutes. Use your private link to fill out the intake and pick a setup time. The page never asks for passwords, keys, or card numbers.
      </Paragraph>
      {scheduling ? <PrimaryButton href={scheduling} label={LAUNCH_INTAKE_BUTTON} /> : null}
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
