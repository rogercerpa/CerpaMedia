import { oneLine } from "./format";
import { Bullet, DetailBox, EmailLayout, Paragraph, Subheading } from "./layout";

export interface BookingConfirmationProps {
  customerName: string;
  formattedStartTime: string;
  platformPref: string;
  adminEmail: string;
}

export function BookingConfirmationEmail({
  customerName,
  formattedStartTime,
  platformPref,
  adminEmail,
}: BookingConfirmationProps) {
  const name = oneLine(customerName) || "there";
  const when = oneLine(formattedStartTime);
  const platform = oneLine(platformPref);
  const contact = oneLine(adminEmail);

  return (
    <EmailLayout
      preview="Your Technology Strategy Call is confirmed."
      title="Technology Strategy Call Confirmed"
    >
      <Paragraph>{`Hi ${name},`}</Paragraph>
      <Paragraph>
        Thank you for booking a Technology Strategy Call with CerpaMedia. Your payment has been received and your session is confirmed.
      </Paragraph>
      <DetailBox>
        <Subheading>Session Details</Subheading>
        <Paragraph>
          <strong>Date &amp; Time:</strong> {` ${when}`}
        </Paragraph>
        <Paragraph>
          <strong>Duration:</strong> 30-45 minutes
        </Paragraph>
        <Paragraph>
          <strong>Platform:</strong> {` ${platform}`}
        </Paragraph>
      </DetailBox>
      <Subheading>What&apos;s Next?</Subheading>
      <Paragraph>
        {`Roger Cerpa will send you the ${platform} meeting link shortly before your scheduled session.`}
      </Paragraph>
      <Paragraph>To get the most out of your call, please come prepared with:</Paragraph>
      <Bullet>A brief overview of your business and current technology setup</Bullet>
      <Bullet>Specific challenges or opportunities you&apos;d like to discuss</Bullet>
      <Bullet>Any questions you have about technology integration</Bullet>
      <Paragraph>
        Within 24-48 hours after your call, you&apos;ll receive an email summary with 3-5 key opportunities and recommended next steps.
      </Paragraph>
      <Paragraph>
        {`If you need to reschedule or have any questions, please contact us at ${contact}.`}
      </Paragraph>
      <Paragraph>Looking forward to speaking with you!</Paragraph>
      <Paragraph>
        <strong>CerpaMedia</strong>
      </Paragraph>
    </EmailLayout>
  );
}
