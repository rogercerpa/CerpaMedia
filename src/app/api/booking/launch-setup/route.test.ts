import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.hoisted(() => vi.fn());
const slotsMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => {
  const mock = {
    launchPurchase: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    launchSetupSettings: {
      findUnique: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(mock)),
  };
  return mock;
});

vi.mock("resend", () => ({
  Resend: class Resend {
    emails = { send: sendMock };
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/availability", () => ({
  getAvailableSlots: slotsMock,
}));

import { POST } from "./route";

const TOKEN = "a".repeat(43);
const START = "2026-11-02T15:00:00.000Z";
const END = "2026-11-02T16:30:00.000Z";

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  slotsMock.mockReset();
  prismaMock.launchPurchase.findUnique.mockReset();
  prismaMock.launchPurchase.updateMany.mockReset();
  prismaMock.launchSetupSettings.findUnique.mockReset();
  prismaMock.booking.findFirst.mockReset();
  prismaMock.booking.create.mockReset();
  prismaMock.booking.delete.mockReset();
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "cerpamedia@gmail.com";
  delete process.env.CONTACT_FROM_EMAIL;
});

describe("gated launch setup booking", () => {
  it("rejects a public request with no purchase token", async () => {
    const response = await post({ token: "short" });
    expect(response.status).toBe(404);
    expect(prismaMock.booking.create).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects a location outside Zoom, Teams, or the Woodstock area", async () => {
    const response = await post({ platformPref: "My house, 123 Main Street" });
    expect(response.status).toBe(400);
    expect(prismaMock.booking.create).not.toHaveBeenCalled();
  });

  it("confirms a paid client's setup session without charging again", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue({
      id: "lp_1",
      bookingId: null,
      buyerEmail: "avery@example.com",
      buyerName: "Avery Buyer",
      tier: "founding",
    });
    prismaMock.launchSetupSettings.findUnique.mockResolvedValue({ slotLengthMin: 90 });
    slotsMock.mockResolvedValue([{ start: new Date(START), end: new Date(END) }]);
    prismaMock.booking.findFirst.mockResolvedValue(null);
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.booking.create.mockImplementation(async ({ data }) => ({
      id: "bk_launch_1",
      status: "confirmed",
      intakeAnswers: data.intakeAnswers,
      stripeSessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }));

    const response = await post({});
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.confirmed).toBe(true);
    expect(body.durationMinutes).toBe(90);

    const created = prismaMock.booking.create.mock.calls[0][0].data;
    expect(created.serviceInterest).toBe("launch_setup");
    expect(created.platformPref).toBe("In person (Woodstock, GA area)");
    expect(created.customerEmail).toBe("avery@example.com");
    expect(created.stripeSessionId).toBeUndefined();

    expect(sendMock).toHaveBeenCalledTimes(2);
    const customer = sendMock.mock.calls[0][0];
    const admin = sendMock.mock.calls[1][0];
    expect(customer.to).toBe("avery@example.com");
    expect(customer.subject).toBe("Your AI Teammate Launch setup session is confirmed");
    expect(customer.html).toContain("90 minutes");
    expect(customer.html).toContain("Woodstock, GA area");
    expect(customer.html).toContain("we don&#x27;t text");
    expect(customer.html).not.toMatch(/\$99/);
    expect(customer.text).not.toMatch(/\$99|sms|text message/i);
    expect(customer.html).not.toMatch(/\b\d+\s+[A-Za-z0-9.]+ (Street|St|Avenue|Ave|Road|Rd)\b/);
    expect(admin.to).toBe("cerpamedia@gmail.com");
    expect(admin.subject).toContain("New Launch Setup:");
    expect(admin.html).toContain("AI Teammate Launch");
    expect(admin.html).not.toMatch(/\$99/);
  });

  it("does not book a second session for the same purchase", async () => {
    prismaMock.launchPurchase.findUnique.mockResolvedValue({
      id: "lp_1",
      bookingId: "bk_existing",
      buyerEmail: "avery@example.com",
    });
    const response = await post({});
    expect(response.status).toBe(409);
    expect(prismaMock.booking.create).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

function post(overrides: Record<string, unknown>) {
  const payload = {
    token: TOKEN,
    startTime: START,
    endTime: END,
    customerName: "Avery Buyer",
    customerEmail: "avery@example.com",
    customerPhone: "4045550199",
    customerCompany: "Buyer Co",
    notes: "Please start with invoice reminders.",
    platformPref: "In person (Woodstock, GA area)",
    website: "",
    ...overrides,
  };
  return POST(
    new NextRequest("https://cerpamedia.com/api/booking/launch-setup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
      },
      body: JSON.stringify(payload),
    })
  );
}
