import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { AdminMagicLinkEmail, type AdminMagicLinkProps } from "./admin-magic-link";
import { BookingConfirmationEmail, type BookingConfirmationProps } from "./booking-confirmation";
import { BookingNoticeEmail, type BookingNoticeProps } from "./booking-notice";
import { ContactConfirmationEmail, type ContactConfirmationProps } from "./contact-confirmation";
import { ContactNoticeEmail, type ContactNoticeProps } from "./contact-notice";
import { LaunchPurchaseNoticeEmail, type LaunchPurchaseNoticeProps } from "./launch-purchase-notice";
import { firstNameFrom, oneLine } from "./format";
import { getEmailReplyTo } from "@/lib/email";
import { launchPurchaseSubject } from "@/lib/launch-checkout";
import type { BookingKind } from "@/lib/launch-booking-shared";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export async function renderEmail(node: ReactElement): Promise<{ html: string; text: string }> {
  const html = await render(node);
  const text = await render(node, { plainText: true });
  return { html, text };
}

export function contactNoticeSubject(name: string): string {
  return `New Contact Form Submission from ${oneLine(name)}`;
}

export function contactConfirmationSubject(name: string): string {
  return `We got your message, ${firstNameFrom(name)}`;
}

export const BOOKING_CONFIRMATION_SUBJECT = "Your Technology Strategy Call is Confirmed";

export function bookingConfirmationSubject(kind?: BookingKind): string {
  if (kind === "launch_setup") return "Your AI Teammate Launch setup session is confirmed";
  return BOOKING_CONFIRMATION_SUBJECT;
}

export function bookingNoticeSubject(
  customerName: string,
  formattedStartTime: string,
  kind?: BookingKind
): string {
  const prefix = kind === "launch_setup" ? "New Launch Setup" : "New Booking";
  return `${prefix}: ${oneLine(customerName)} - ${oneLine(formattedStartTime)}`;
}

export const ADMIN_LOGIN_SUBJECT = "Your CerpaMedia Admin Login Link";

export async function renderContactNotice(props: ContactNoticeProps): Promise<RenderedEmail> {
  const rendered = await renderEmail(<ContactNoticeEmail {...props} />);
  return { subject: contactNoticeSubject(props.name), ...rendered };
}

export async function renderContactConfirmation(
  props: ContactConfirmationProps
): Promise<RenderedEmail> {
  const rendered = await renderEmail(<ContactConfirmationEmail {...props} />);
  return { subject: contactConfirmationSubject(props.name), ...rendered };
}

export async function renderBookingConfirmation(
  props: BookingConfirmationProps
): Promise<RenderedEmail> {
  const rendered = await renderEmail(<BookingConfirmationEmail {...props} />);
  return { subject: bookingConfirmationSubject(props.kind), ...rendered };
}

export async function renderBookingNotice(props: BookingNoticeProps): Promise<RenderedEmail> {
  const rendered = await renderEmail(<BookingNoticeEmail {...props} />);
  return {
    subject: bookingNoticeSubject(props.customerName, props.formattedStartTime, props.kind),
    ...rendered,
  };
}

export async function renderLaunchPurchaseNotice(
  props: LaunchPurchaseNoticeProps
): Promise<RenderedEmail> {
  const rendered = await renderEmail(<LaunchPurchaseNoticeEmail {...props} />);
  return {
    subject: launchPurchaseSubject(props.tier, props.amountDisplay),
    ...rendered,
  };
}

export async function renderAdminMagicLink(props: AdminMagicLinkProps): Promise<RenderedEmail> {
  const rendered = await renderEmail(<AdminMagicLinkEmail {...props} />);
  return { subject: ADMIN_LOGIN_SUBJECT, ...rendered };
}

export interface BookingEmailInput extends BookingNoticeProps {
  adminEmail: string;
}

export async function createBookingEmails(input: BookingEmailInput) {
  const customer = await renderBookingConfirmation({
    customerName: input.customerName,
    formattedStartTime: input.formattedStartTime,
    platformPref: input.platformPref,
    adminEmail: input.adminEmail,
    kind: input.kind,
    durationLabel: input.durationLabel,
  });
  const admin = await renderBookingNotice(input);

  return {
    customer: {
      ...customer,
      to: input.customerEmail,
      replyTo: getEmailReplyTo(),
    },
    admin: {
      ...admin,
      to: input.adminEmail,
      replyTo: input.customerEmail,
    },
  };
}
