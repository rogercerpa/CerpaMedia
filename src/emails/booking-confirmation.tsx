import type { BookingKind } from "@/lib/launch-booking-shared";
import { oneLine } from "./format";
import { Bullet, DetailBox, EmailLayout, Paragraph, Subheading } from "./layout";

export interface BookingConfirmationProps {
  customerName: string;
  formattedStartTime: string;
  platformPref: string;
  adminEmail: string;
  kind?: BookingKind;
  durationLabel?: string;
}

export function BookingConfirmationEmail({
  customerName,
  formattedStartTime,
  platformPref,
  adminEmail,
  kind = "strategy_call",
  durationLabel,
}: BookingConfirmationProps) {
  const name = oneLine(customerName) || "there";
  const when = oneLine(formattedStartTime);
  const platform = oneLine(platformPref);
  const contact = oneLine(adminEmail);
  const duration = oneLine(durationLabel || "") || (kind === "launch_setup" ? "90 minutes" : "30-45 minutes");
  const inPerson = platform.toLowerCase().startsWith("in person");

  if (kind === "launch_setup") {
    return (
      <EmailLayout
        preview="Your AI Teammate Launch setup session is confirmed."
        title="Setup session confirmed"
      >
        <Paragraph>{`Hi ${name},`}</Paragraph>
        <Paragraph>
          Your AI Teammate Launch setup session is confirmed. This session is included with your purchase. There is no additional charge.
        </Paragraph>
        <DetailBox>
          <Subheading>Session Details</Subheading>
          <Paragraph>
            <strong>Date &amp; Time:</strong> {` ${when}`}
          </Paragraph>
          <Paragraph>
            <strong>Duration:</strong> {` ${duration}`}
          </Paragraph>
          <Paragraph>
            <strong>Where:</strong> {` ${platform}`}
          </Paragraph>
        </DetailBox>
        <Subheading>What&apos;s Next?</Subheading>
        <Paragraph>
          {inPerson
            ? "Roger Cerpa will confirm the meeting place in the Woodstock, GA area before your session. We don't publish a street address."
            : `Roger Cerpa will send you the ${platform} meeting link shortly before your setup session.`}
        </Paragraph>
        <Paragraph>Please have these ready:</Paragraph>
        <Bullet>The intake form, if Roger has already sent it</Bullet>
        <Bullet>The tools and logins you want to connect, without sharing passwords in email</Bullet>
        <Bullet>Any questions about the two teammates you want launched</Bullet>
        <Paragraph>
          {`If you need to reschedule, email or call us at ${contact}. We email or call; we don't text.`}
        </Paragraph>
        <Paragraph>Looking forward to the setup session.</Paragraph>
        <Paragraph>
          <strong>CerpaMedia</strong>
        </Paragraph>
      </EmailLayout>
    );
  }

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
          <strong>Duration:</strong> {` ${duration}`}
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
