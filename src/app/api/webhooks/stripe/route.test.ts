import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { FOUNDING_PAYMENT_LINK_ID, REGULAR_PAYMENT_LINK_ID } from "@/lib/launch-offer";

const sendMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  launchPurchase: {
    findUnique: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  booking: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  checkoutHold: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: class Resend {
    emails = { send: sendMock };
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "./route";

const SECRET = "whsec_test_secret";
const stripe = new Stripe("sk_test_123", { apiVersion: "2026-09-30.endive" });

const originalEnv = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
};

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  prismaMock.launchPurchase.findUnique.mockReset();
  prismaMock.launchPurchase.create.mockReset();
  prismaMock.launchPurchase.updateMany.mockReset();
  prismaMock.launchPurchase.update.mockReset();
  prismaMock.booking.findUnique.mockReset();
  prismaMock.checkoutHold.findUnique.mockReset();
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "cerpamedia@gmail.com";
  delete process.env.CONTACT_FROM_EMAIL;
  process.env.NEXT_PUBLIC_BASE_URL = "https://cerpamedia.com";
  delete process.env.EMAIL_REPLY_TO;
});

afterEach(() => {
  restore("STRIPE_SECRET_KEY", originalEnv.STRIPE_SECRET_KEY);
  restore("STRIPE_WEBHOOK_SECRET", originalEnv.STRIPE_WEBHOOK_SECRET);
  restore("RESEND_API_KEY", originalEnv.RESEND_API_KEY);
  restore("CONTACT_TO_EMAIL", originalEnv.CONTACT_TO_EMAIL);
  restore("CONTACT_FROM_EMAIL", originalEnv.CONTACT_FROM_EMAIL);
  restore("NEXT_PUBLIC_BASE_URL", originalEnv.NEXT_PUBLIC_BASE_URL);
  restore("EMAIL_REPLY_TO", originalEnv.EMAIL_REPLY_TO);
});

describe("Stripe webhook launch purchases", () => {
  it("emails the buyer and Roger for a founding payment link and stores the purchase", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue(null);
    prismaMock.launchPurchase.create.mockImplementation(async ({ data }) => ({
      id: "lp_1",
      adminNotifiedAt: null,
      ...data,
    }));
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});

    const response = await postEvent(launchEvent({
      payment_link: FOUNDING_PAYMENT_LINK_ID,
      amount_total: 79900,
      metadata: { offer: "ai-teammate-launch", tier: "founding" },
      discounts: [{ promotion_code: { code: "FOUNDING10" } }],
    }));

    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);

    const welcome = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "avery@example.com");
    const admin = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "cerpamedia@gmail.com");
    expect(welcome).toBeTruthy();
    expect(admin).toBeTruthy();

    expect(welcome.from).toBe("CerpaMedia <info@cerpamedia.com>");
    expect(welcome.replyTo).toBe("cerpamedia@gmail.com");
    expect(welcome.subject).toBe("You're in — next steps for your AI Teammate Launch");
    expect(welcome.html).toContain("founding");
    expect(welcome.html).toContain("$799");
    expect(welcome.html).toContain("about 15 minutes");
    expect(welcome.html).toContain("Fill out your intake and pick your setup time");
    expect(welcome.html).not.toContain("docs.google.com");
    expect(welcome.html).toContain("https://cerpamedia.com/launch/setup/");
    expect(welcome.text).toContain("Reply to this email or call (943) 248-7410.");
    expect(welcome.html).not.toMatch(/\$99|sms|text message/i);
    expect(welcome.text).not.toMatch(/\$99|sms|text message/i);

    expect(admin.from).toBe("CerpaMedia <info@cerpamedia.com>");
    expect(admin.subject).toBe("New AI Teammate Launch purchase — founding $799");
    expect(admin.html).toContain("Avery Buyer");
    expect(admin.html).toContain("avery@example.com");
    expect(admin.html).toContain("+14045550199");
    expect(admin.html).toContain("$799");
    expect(admin.html).toContain("founding");
    expect(admin.html).toContain("FOUNDING10");
    expect(admin.html).toContain("cs_test_launch_1");
    expect(admin.html).toContain("https://dashboard.stripe.com/test/checkout/sessions/cs_test_launch_1");
    expect(admin.html).toContain("Welcome email sent to avery@example.com.");
    expect(admin.html).toContain("https://cerpamedia.com/launch/setup/");
    expect(admin.html).not.toContain("sent by hand");
    expect(admin.html).not.toMatch(/\$99/);
    expect(admin.text).not.toMatch(/\$99|sms|text message/i);

    expect(prismaMock.launchPurchase.create).toHaveBeenCalledTimes(1);
    const stored = prismaMock.launchPurchase.create.mock.calls[0][0].data;
    expect(stored.tier).toBe("founding");
    expect(stored.bookingToken).toEqual(expect.any(String));
    expect(stored.bookingToken.length).toBeGreaterThanOrEqual(32);
  });

  it("labels the regular payment link and does not email the buyer again on retry", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValueOnce(null);
    prismaMock.launchPurchase.create.mockImplementation(async ({ data }) => ({
      id: "lp_2",
      adminNotifiedAt: null,
      ...data,
    }));
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});

    const first = await postEvent(launchEvent({
      id: "cs_test_regular_1",
      payment_link: REGULAR_PAYMENT_LINK_ID,
      amount_total: 119900,
      metadata: { offer: "ai-teammate-launch", tier: "regular" },
      customer_details: { name: "Riley Client", email: "riley@example.com", phone: null },
      customer_email: "riley@example.com",
      discounts: null,
    }));
    expect(first.status).toBe(200);
    const admin = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "cerpamedia@gmail.com");
    const welcome = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "riley@example.com");
    expect(admin.subject).toBe("New AI Teammate Launch purchase — regular $1,199");
    expect(admin.html).toContain("None");
    expect(welcome.subject).toBe("You're in — next steps for your AI Teammate Launch");
    expect(welcome.html).toContain("$1,199");
    expect(welcome.html).toContain("regular");

    sendMock.mockClear();
    prismaMock.launchPurchase.findUnique.mockResolvedValue({
      id: "lp_2",
      adminNotifiedAt: new Date("2026-10-21T12:00:00Z"),
      welcomeSentAt: new Date("2026-10-21T12:00:00Z"),
      buyerEmail: "riley@example.com",
      bookingToken: "already-sent-token-already-sent-token-xyz",
      tier: "regular",
    });

    const retry = await postEvent(launchEvent({
      id: "cs_test_regular_1",
      payment_link: REGULAR_PAYMENT_LINK_ID,
      amount_total: 119900,
      metadata: { offer: "ai-teammate-launch", tier: "regular" },
    }), "evt_retry");
    expect(retry.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 200 for events it ignores and 400 for a bad signature", async () => {
    const ignored = await postEvent({
      id: "evt_ignored",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1" } },
    });
    expect(ignored.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
    expect(prismaMock.launchPurchase.create).not.toHaveBeenCalled();

    const unpaid = await postEvent(launchEvent({ payment_status: "unpaid" }));
    expect(unpaid.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();

    const request = new NextRequest("https://cerpamedia.com/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "t=1,v1=bad" },
    });
    const invalid = await POST(request);
    expect(invalid.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the admin email fails so Stripe can retry", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue(null);
    prismaMock.launchPurchase.create.mockImplementation(async ({ data }) => ({
      id: "lp_3",
      adminNotifiedAt: null,
      ...data,
    }));
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});
    sendMock.mockResolvedValue({ data: null, error: { message: "rejected" } });

    const response = await postEvent(launchEvent());
    expect(response.status).toBe(500);
    expect(prismaMock.launchPurchase.update).toHaveBeenCalledWith({
      where: { id: "lp_3" },
      data: { notifyClaimedAt: null },
    });
  });

  it("puts the intake and the setup time on the buyer's private link", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue(null);
    prismaMock.launchPurchase.create.mockImplementation(async ({ data }) => ({
      id: "lp_4",
      adminNotifiedAt: null,
      welcomeSentAt: null,
      ...data,
    }));
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});

    const response = await postEvent(launchEvent({ id: "cs_test_no_intake" }));
    expect(response.status).toBe(200);
    const welcome = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "avery@example.com");
    const admin = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "cerpamedia@gmail.com");
    expect(welcome.html).toContain("Fill out your intake and pick your setup time");
    expect(welcome.html).not.toContain("docs.google.com");
    expect(welcome.text).toContain("Reply to this email or call (943) 248-7410.");
    expect(admin.html).not.toContain("sent by hand");
    expect(admin.html).not.toContain("ATL_INTAKE_FORM_URL");
    expect(admin.text).toContain("private link to fill out the intake");
  });

  it("retries only the buyer welcome after the admin alert already went out", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue(null);
    prismaMock.launchPurchase.create.mockImplementation(async ({ data }) => ({
      id: "lp_5",
      adminNotifiedAt: null,
      welcomeSentAt: null,
      ...data,
    }));
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});
    sendMock.mockImplementation(async (payload: { to: string }) => {
      if (payload.to === "avery@example.com") {
        return { data: null, error: { message: "rejected" } };
      }
      return { data: { id: "email_admin" }, error: null };
    });

    const failed = await postEvent(launchEvent({ id: "cs_test_welcome_retry" }), "evt_welcome_fail");
    expect(failed.status).toBe(500);
    const admin = sendMock.mock.calls.map((call) => call[0]).find((email) => email.to === "cerpamedia@gmail.com");
    expect(admin.html).toContain("Welcome email failed.");

    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email_welcome" }, error: null });
    prismaMock.launchPurchase.findUnique.mockResolvedValue({
      id: "lp_5",
      adminNotifiedAt: new Date("2026-10-21T12:00:00Z"),
      welcomeSentAt: null,
      buyerName: "Avery Buyer",
      buyerEmail: "avery@example.com",
      buyerPhone: "+14045550199",
      tier: "founding",
      amountTotal: 79900,
      currency: "usd",
      promoCode: "FOUNDING10",
      bookingToken: "retry-token-retry-token-retry-token-xyz",
      bookingId: null,
      livemode: false,
      stripeSessionId: "cs_test_welcome_retry",
      createdAt: new Date("2026-10-21T12:00:00Z"),
    });

    const retried = await postEvent(launchEvent({ id: "cs_test_welcome_retry" }), "evt_welcome_retry");
    expect(retried.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("avery@example.com");
    expect(sendMock.mock.calls[0][0].subject).toBe("You're in — next steps for your AI Teammate Launch");
  });
});

function launchEvent(sessionOverrides: Record<string, unknown> = {}, eventId = "evt_test_launch") {
  const session = {
    id: "cs_test_launch_1",
    object: "checkout.session",
    payment_status: "paid",
    payment_link: FOUNDING_PAYMENT_LINK_ID,
    amount_total: 79900,
    currency: "usd",
    livemode: false,
    customer_email: "avery@example.com",
    customer_details: {
      name: "Avery Buyer",
      email: "avery@example.com",
      phone: "+14045550199",
    },
    metadata: {
      offer: "ai-teammate-launch",
      tier: "founding",
    },
    ...sessionOverrides,
  };
  return {
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    data: { object: session },
  };
}

async function postEvent(event: unknown, _eventId?: string) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: SECRET,
  });
  const request = new NextRequest("https://cerpamedia.com/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": signature },
  });
  return POST(request);
}

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
