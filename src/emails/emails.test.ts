import { describe, expect, it } from "vitest";
import { formatEasternTimestamp } from "./format";
import {
  ADMIN_LOGIN_SUBJECT,
  BOOKING_CONFIRMATION_SUBJECT,
  createBookingEmails,
  renderAdminMagicLink,
  renderBookingConfirmation,
  renderBookingNotice,
  renderContactConfirmation,
  renderContactNotice,
  renderLaunchPurchaseNotice,
  renderLaunchSetupReminder,
  renderLaunchWelcome,
} from "./messages";
import { LAUNCH_WELCOME_CLOSING, LAUNCH_WELCOME_SUBJECT } from "./launch-welcome";
import { LAUNCH_REMINDER_SUBJECT } from "./launch-setup-reminder";
import { FOOTER_ADDRESS, SITE_URL } from "./theme";

const RECEIVED = "Thursday, January 15, 2026 at 1:30 PM EST";
const SESSION = "Thursday, October 15, 2026 at 2:00 PM EDT";

describe("formatEasternTimestamp", () => {
  it("formats timestamps in America/New_York", () => {
    expect(formatEasternTimestamp(new Date("2026-01-15T18:30:00Z"))).toBe(RECEIVED);
  });
});

describe("branded email rendering", () => {
  it("renders an escaped contact notice with a reply link and plain text", async () => {
    const email = await renderContactNotice({
      name: `Ann <script>alert("x")</script>`,
      email: "ann@example.com",
      company: "Tom & Jerry's",
      service: "AI <integration>",
      message: `Price is a < b & "quotes"\nSecond line`,
      receivedAt: RECEIVED,
    });

    expect(email.subject).toBe(
      `New Contact Form Submission from Ann <script>alert("x")</script>`
    );
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Internal notice");
    expect(email.html).toContain("New Contact Form Submission");
    expect(email.html).toContain("Reply to Ann &lt;script&gt;");
    expect(email.html).toContain("mailto:ann@example.com");
    expect(email.html).toContain("Tom &amp; Jerry");
    expect(email.html).toContain("a &lt; b &amp;");
    expect(email.html).toContain("Second line");
    expect(email.html).toContain(RECEIVED);
    expect(email.html).not.toMatch(/<script[\s>]/i);
    expect(email.text).toContain(`Ann <script>alert("x")</script>`);
    expect(email.text).toContain("a < b &");
    expect(email.text).toContain("Reply to Ann");
    expect(email.text).toContain(RECEIVED);
  });

  it("omits an empty phone on the contact notice and skips an unsafe mailto", async () => {
    const email = await renderContactNotice({
      name: "Jane Doe",
      email: "not an email",
      message: "Hello there, I would like to talk.",
      receivedAt: RECEIVED,
    });

    expect(email.html).not.toContain(">Phone<");
    expect(email.html).not.toContain("mailto:");
    expect(email.html).toContain("Not provided");
    expect(email.html).toContain("Not specified");
  });

  it("renders a short contact confirmation without a sales pitch", async () => {
    const email = await renderContactConfirmation({
      name: "Mary Jane Watson",
      email: "mary@example.com",
      company: "Daily Bugle",
      service: "",
      message: "Can you help us untangle our tools?\nThanks",
    });

    expect(email.subject).toBe("We got your message, Mary");
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Hi Mary");
    expect(email.html).toContain("within 1 business day by email or phone");
    expect(email.html).toContain("Roger Cerpa, CerpaMedia");
    expect(email.html).toContain("Daily Bugle");
    expect(email.html).toContain("Can you help us untangle our tools?");
    expect(email.html).not.toContain("Service");
    expect(email.html).not.toContain("Reply to");
    expect(email.html).not.toMatch(/sms|text message|\$99/i);
    expect(email.text).toContain("Roger Cerpa, CerpaMedia");
    expect(email.text).toContain("within 1 business day by email or phone");
    expect(email.text).not.toMatch(/sms|text message|\$99/i);

    const hrefs = hrefValues(email.html);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href.startsWith(SITE_URL)).toBe(true);
    }
  });

  it("escapes confirmation fields that survive as text", async () => {
    const email = await renderContactConfirmation({
      name: "Tom & Jerry",
      email: "tom@example.com",
      message: `Please look at <img src=x onerror=alert(1) and the cost & timeline.`,
    });

    expect(email.subject).toBe("We got your message, Tom");
    expect(email.html).toContain("Tom &amp; Jerry");
    expect(email.html).toContain("&lt;img");
    expect(email.html).toContain("&amp; timeline");
    expect(email.html).not.toMatch(/<img[\s>]/i);
    expect(email.text).toContain("Tom & Jerry");
    expect(email.text).toContain("<img");
  });

  it("keeps the booking confirmation copy and stays short of a sales button", async () => {
    const email = await renderBookingConfirmation({
      customerName: "Jordan Hale",
      formattedStartTime: SESSION,
      platformPref: "Zoom",
      adminEmail: "cerpamedia@gmail.com",
    });

    expect(email.subject).toBe(BOOKING_CONFIRMATION_SUBJECT);
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Hi Jordan Hale");
    expect(email.html).toContain("Your payment has been received and your session is confirmed.");
    expect(email.html).toContain("Session Details");
    expect(email.html).toContain(SESSION);
    expect(email.html).toContain("30-45 minutes");
    expect(email.html).toContain("Zoom");
    expect(email.html).toContain("What&#x27;s Next?");
    expect(email.text.toLowerCase()).toContain("what's next?");
    expect(email.html).toContain(
      "Roger Cerpa will send you the Zoom meeting link shortly before your scheduled session."
    );
    expect(email.html).toContain("3-5 key opportunities");
    expect(email.html).toContain("cerpamedia@gmail.com");
    expect(email.html).toContain("Looking forward to speaking with you!");
    expect(email.html).not.toMatch(/\$99|sms|text message/i);
    expect(email.text).toContain("30-45 minutes");
  });

  it("renders the booking notice with labeled fields, a reply button, and escaped notes", async () => {
    const emails = await createBookingEmails({
      customerName: "Jordan <b>Hale</b>",
      customerEmail: "jordan@hale.example",
      customerPhone: "(404) 555-0138",
      customerCompany: "Hale & Co.",
      formattedStartTime: SESSION,
      platformPref: "Microsoft Teams",
      serviceLabel: "AI integration / AI consulting",
      bookingId: "bk_123",
      notes: `We need <script>alert(1)</script> help\nwith billing`,
      intakeAnswers: {
        team_size: "12",
        empty_note: "",
        skipped: null,
        stack: "a < b & c",
      },
      consultBrief: "Brief line\n<script>nope</script>",
      adminEmail: "roger@cerpamedia.com",
    });

    expect(emails.customer.to).toBe("jordan@hale.example");
    expect(emails.customer.replyTo).toBe("cerpamedia@gmail.com");
    expect(emails.customer.subject).toBe(BOOKING_CONFIRMATION_SUBJECT);

    expect(emails.admin.to).toBe("roger@cerpamedia.com");
    expect(emails.admin.replyTo).toBe("jordan@hale.example");
    expect(emails.admin.subject).toBe(`New Booking: Jordan <b>Hale</b> - ${SESSION}`);
    expectBranded(emails.admin.html, emails.admin.text);
    expect(emails.admin.html).toContain("Reply to Jordan &lt;b&gt;Hale&lt;/b&gt;");
    expect(emails.admin.html).toContain("mailto:jordan@hale.example");
    expect(emails.admin.html).toContain("(404) 555-0138");
    expect(emails.admin.html).toContain("Hale &amp; Co.");
    expect(emails.admin.html).toContain("Microsoft Teams");
    expect(emails.admin.html).toContain("AI integration / AI consulting");
    expect(emails.admin.html).toContain("bk_123");
    expect(emails.admin.html).toContain("30-45 minutes");
    expect(emails.admin.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(emails.admin.html).toContain("with billing");
    expect(emails.admin.html).toContain("team size");
    expect(emails.admin.html).toContain("a &lt; b &amp; c");
    expect(emails.admin.html).not.toContain("empty note");
    expect(emails.admin.html).toContain("For Consult Secretary Bot");
    expect(emails.admin.html).toContain("Brief line");
    expect(emails.admin.html).toContain(
      "Action Required: Send Microsoft Teams meeting link to the customer before the scheduled time."
    );
    expect(emails.admin.html).not.toMatch(/<script[\s>]/i);
    expect(emails.admin.text).toContain("Action Required:");
    expect(emails.admin.text).toContain("<script>alert(1)</script>");
  });

  it("hides phone and extra context when the booking has neither", async () => {
    const email = await renderBookingNotice({
      customerName: "Jordan Hale",
      customerEmail: "jordan@hale.example",
      customerPhone: "   ",
      customerCompany: "",
      formattedStartTime: SESSION,
      platformPref: "Zoom",
      serviceLabel: "Not sure yet",
      bookingId: "bk_9",
      notes: null,
      intakeAnswers: {},
      consultBrief: "Brief",
    });

    expect(email.html).not.toContain(">Phone<");
    expect(email.html).not.toContain("Additional Context");
    expect(email.html).toContain("(not provided)");
    expect(email.html).toContain("Not provided");
  });

  it("words the setup-session confirmation for a paid launch client", async () => {
    const email = await renderBookingConfirmation({
      customerName: "Avery Buyer",
      formattedStartTime: SESSION,
      platformPref: "In person (Woodstock, GA area)",
      adminEmail: "cerpamedia@gmail.com",
      kind: "launch_setup",
      durationLabel: "90 minutes",
    });

    expect(email.subject).toBe("Your AI Teammate Launch setup session is confirmed");
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Hi Avery Buyer");
    expect(email.html).toContain("included with your purchase");
    expect(email.html).toContain("90 minutes");
    expect(email.html).toContain("Woodstock, GA area");
    expect(email.html).toContain("don&#x27;t publish a street address");
    expect(email.html).toContain("we don&#x27;t text");
    expect(email.text).toContain("90 minutes");
    expect(email.html).not.toMatch(/\$99|sms|text message/i);
    expect(email.text).not.toMatch(/\$99|sms|text message/i);
  });

  it("builds the admin launch purchase notice and records the welcome result", async () => {
    const email = await renderLaunchPurchaseNotice({
      buyerName: "Avery Buyer",
      buyerEmail: "avery@example.com",
      buyerPhone: "+14045550199",
      amountDisplay: "$799",
      tier: "founding",
      promoCode: "None",
      stripeSessionId: "cs_test_launch_1",
      dashboardUrl: "https://dashboard.stripe.com/test/checkout/sessions/cs_test_launch_1",
      schedulingUrl: "https://cerpamedia.com/launch/setup/token",
      welcomeDelivery: "sent",
    });

    expect(email.subject).toBe("New AI Teammate Launch purchase — founding $799");
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Avery Buyer");
    expect(email.html).toContain("avery@example.com");
    expect(email.html).toContain("+14045550199");
    expect(email.html).toContain("None");
    expect(email.html).toContain("cs_test_launch_1");
    expect(email.html).toContain("https://dashboard.stripe.com/test/checkout/sessions/cs_test_launch_1");
    expect(email.html).toContain("https://cerpamedia.com/launch/setup/token");
    expect(email.html).toContain("Welcome email sent to avery@example.com.");
    expect(email.text).toContain("Welcome email sent to avery@example.com.");
    expect(email.html).not.toContain("sent by hand");
    expect(email.html).not.toMatch(/\$99/);

    const failed = await renderLaunchPurchaseNotice({
      buyerName: "Avery Buyer",
      buyerEmail: "avery@example.com",
      buyerPhone: "",
      amountDisplay: "$799",
      tier: "founding",
      promoCode: "None",
      stripeSessionId: "cs_test_launch_1",
      dashboardUrl: "https://dashboard.stripe.com/test/checkout/sessions/cs_test_launch_1",
      schedulingUrl: "https://cerpamedia.com/launch/setup/token",
      welcomeDelivery: "failed",
    });
    expect(failed.html).toContain("Welcome email failed.");
    expect(failed.html).not.toContain("sent by hand");
    expect(failed.html).not.toContain("ATL_INTAKE_FORM_URL");
    expect(failed.text).toContain("Resend it from Admin");
  });

  it("builds the buyer welcome with one private link for the intake and the setup time", async () => {
    const email = await renderLaunchWelcome({
      buyerName: "Avery Buyer",
      tier: "founding",
      amountDisplay: "$799",
      schedulingUrl: "https://cerpamedia.com/launch/setup/token",
    });

    expect(email.subject).toBe(LAUNCH_WELCOME_SUBJECT);
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Hi Avery");
    expect(email.html).toContain("founding");
    expect(email.html).toContain("$799");
    expect(email.html).toContain("about 15 minutes");
    expect(email.html).toContain("Fill out your intake and pick your setup time");
    expect(email.html).not.toContain("docs.google.com");
    expect(email.html).not.toContain("Choose a date and time");
    expect(email.html).toContain("https://cerpamedia.com/launch/setup/token");
    expect(email.html).toContain("Roger will review your intake before the session.");
    expect(email.html).toContain("passwords, keys, or card numbers");
    expect(email.text).toContain(LAUNCH_WELCOME_CLOSING);
    expect(email.html).not.toMatch(/sms|text message/i);
    expect(email.text).not.toMatch(/\$99|sms|text message/i);

    const regular = await renderLaunchWelcome({
      buyerName: "Riley Client",
      tier: "regular",
      amountDisplay: "$1,199",
      schedulingUrl: "https://cerpamedia.com/launch/setup/token",
    });
    expect(regular.html).toContain("regular");
    expect(regular.html).toContain("$1,199");
    expect(regular.text).toContain(LAUNCH_WELCOME_CLOSING);
  });

  it("builds one gentle reminder with the same booking link", async () => {
    const email = await renderLaunchSetupReminder({
      buyerName: "Avery Buyer",
      schedulingUrl: "https://cerpamedia.com/launch/setup/token",
    });

    expect(email.subject).toBe(LAUNCH_REMINDER_SUBJECT);
    expectBranded(email.html, email.text);
    expect(email.html).toContain("Hi Avery");
    expect(email.html).toContain("still open");
    expect(email.html).toContain("https://cerpamedia.com/launch/setup/token");
    expect(email.html).toContain("Fill out your intake and pick your setup time");
    expect(email.text).toContain(LAUNCH_WELCOME_CLOSING);
    expect(email.html).not.toMatch(/\$99|sms|text message/i);
    expect(email.text).not.toMatch(/\$99|sms|text message/i);
  });

  it("renders the admin magic link in plain text and refuses a non-http link", async () => {
    const link = "https://cerpamedia.com/admin/verify?token=abc123";
    const email = await renderAdminMagicLink({ magicLink: link });

    expect(email.subject).toBe(ADMIN_LOGIN_SUBJECT);
    expectBranded(email.html, email.text);
    expect(email.html).toContain("CerpaMedia Admin");
    expect(email.html).toContain("Sign In to Admin Panel");
    expect(email.html).toContain(`href="${link}"`);
    expect(email.html).toContain("This link expires in 15 minutes.");
    expect(email.html).toContain("If you didn&#x27;t request this");
    expect(email.text).toContain("If you didn't request this");
    expect(email.html).not.toContain("#65a30d");
    expect(email.text).toContain(link);
    expect(email.text).toContain("15 minutes");

    const unsafe = await renderAdminMagicLink({ magicLink: "javascript:alert(1)" });
    expect(unsafe.html).not.toMatch(/href="javascript:/i);
    expect(unsafe.html).not.toContain("Sign In to Admin Panel");
    expect(unsafe.text).toContain("javascript:alert(1)");
  });
});

function expectBranded(html: string, text: string) {
  expect(html.toLowerCase()).toContain("<!doctype html");
  expect(html).toContain("CerpaMedia");
  expect(html).toContain(FOOTER_ADDRESS);
  expect(html).toContain(SITE_URL);
  expect(html).toContain("Arial, Helvetica, sans-serif");
  expect(html).toContain("@media only screen and (max-width: 620px)");
  expect(html).not.toMatch(/<img[\s>]/i);
  expect(html).not.toContain("#65a30d");
  expect(html).not.toMatch(/\b\d+\s+[A-Za-z0-9.]+ (Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)\b/);
  expect(text.trim().length).toBeGreaterThan(40);
  expect(text).toContain(FOOTER_ADDRESS);
  expect(text).toContain("cerpamedia.com");
}

function hrefValues(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}
