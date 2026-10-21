import { displayValue, oneLine } from "./format";
import { DetailBox, EmailLayout, Field, Paragraph, PrimaryButton, ReplyButton, Subheading } from "./layout";

export type LaunchWelcomeDelivery = "sent" | "failed" | "missing-email";

export interface LaunchPurchaseNoticeProps {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amountDisplay: string;
  tier: string;
  promoCode: string;
  stripeSessionId: string;
  dashboardUrl: string;
  schedulingUrl: string;
  welcomeDelivery: LaunchWelcomeDelivery;
  intakeConfigured: boolean;
}

export function LaunchPurchaseNoticeEmail({
  buyerName,
  buyerEmail,
  buyerPhone,
  amountDisplay,
  tier,
  promoCode,
  stripeSessionId,
  dashboardUrl,
  schedulingUrl,
  welcomeDelivery,
  intakeConfigured,
}: LaunchPurchaseNoticeProps) {
  const name = oneLine(buyerName) || "buyer";
  const email = oneLine(buyerEmail);
  const dashboard = oneLine(dashboardUrl);
  const scheduling = oneLine(schedulingUrl);

  return (
    <EmailLayout
      preview={`New AI Teammate Launch purchase — ${oneLine(tier)} ${oneLine(amountDisplay)}`}
      eyebrow="Internal notice"
      title="New AI Teammate Launch purchase"
    >
      {email ? <ReplyButton name={name} email={email} /> : null}

      <Subheading>Buyer</Subheading>
      <Field label="Name" value={displayValue(buyerName, "Not provided")} />
      <Field label="Email" value={displayValue(buyerEmail, "Not provided")} />
      <Field label="Phone" value={displayValue(buyerPhone, "Not provided")} />

      <Subheading>Payment</Subheading>
      <Field label="Amount paid" value={displayValue(amountDisplay, "Unknown")} />
      <Field label="Tier" value={displayValue(tier, "regular")} />
      <Field label="Promo code" value={displayValue(promoCode, "None")} />
      <Field label="Stripe session id" value={oneLine(stripeSessionId)} />
      <Field label="Dashboard" value={dashboard} />
      {dashboard.startsWith("https://") ? (
        <PrimaryButton href={dashboard} label="Open in Stripe" />
      ) : null}

      <Subheading>Welcome email</Subheading>
      <DetailBox>
        <Paragraph>
          <strong>{welcomeSentence(welcomeDelivery, email)}</strong>
        </Paragraph>
        {!intakeConfigured ? (
          <Paragraph>
            The intake link must be sent by hand. ATL_INTAKE_FORM_URL is not set, so the welcome email does not include the form.
          </Paragraph>
        ) : null}
        {welcomeDelivery === "failed" ? (
          <Paragraph>
            Stripe will retry the welcome email. You can also resend it from Admin → Bookings.
          </Paragraph>
        ) : null}
      </DetailBox>

      <Subheading>Next step</Subheading>
      <DetailBox>
        <Paragraph>
          <strong>{nextStepSentence(welcomeDelivery, intakeConfigured)}</strong>
        </Paragraph>
      </DetailBox>
      <Field label="Setup session link" value={scheduling} />
      {scheduling.startsWith("https://") || scheduling.startsWith("http://") ? (
        <PrimaryButton href={scheduling} label="Open scheduling link" />
      ) : null}
    </EmailLayout>
  );
}

function welcomeSentence(delivery: LaunchWelcomeDelivery, email: string): string {
  if (delivery === "sent") {
    return email ? `Welcome email sent to ${email}.` : "Welcome email sent.";
  }
  if (delivery === "failed") return "Welcome email failed.";
  return "Welcome email not sent. This checkout had no customer email.";
}

function nextStepSentence(delivery: LaunchWelcomeDelivery, intakeConfigured: boolean): string {
  if (!intakeConfigured || delivery !== "sent") {
    return "Send the intake form within 1 business day.";
  }
  return "The buyer has the intake form and the private scheduling link. Review the intake before the setup session.";
}
