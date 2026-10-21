import { displayValue, oneLine } from "./format";
import { DetailBox, EmailLayout, Field, Paragraph, PrimaryButton, ReplyButton, Subheading } from "./layout";

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

      <Subheading>Next step</Subheading>
      <DetailBox>
        <Paragraph>
          <strong>Send the intake form within 1 business day.</strong>
        </Paragraph>
        <Paragraph>
          Do not wait for an automatic customer email. This notice goes to you only.
          Send the buyer the intake form and this private setup-session link. It is not in the site navigation.
        </Paragraph>
      </DetailBox>
      <Field label="Setup session link" value={scheduling} />
      {scheduling.startsWith("https://") || scheduling.startsWith("http://") ? (
        <PrimaryButton href={scheduling} label="Open scheduling link" />
      ) : null}
    </EmailLayout>
  );
}
