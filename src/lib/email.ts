/**
 * Shared sender and reply-to for every Resend email.
 * CONTACT_FROM_EMAIL is the existing env var; when it is unset the sender
 * is the verified cerpamedia.com address.
 */

export const DEFAULT_EMAIL_FROM = "CerpaMedia <info@cerpamedia.com>";
export const DEFAULT_EMAIL_REPLY_TO = "cerpamedia@gmail.com";

export function getEmailFrom(): string {
  const configured = process.env.CONTACT_FROM_EMAIL?.trim();
  return configured || DEFAULT_EMAIL_FROM;
}

export function getEmailReplyTo(): string {
  const configured = process.env.EMAIL_REPLY_TO?.trim();
  return configured || DEFAULT_EMAIL_REPLY_TO;
}
