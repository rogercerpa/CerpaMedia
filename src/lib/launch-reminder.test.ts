import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  launchPurchase: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: class Resend {
    emails = { send: sendMock };
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { sendDueLaunchSetupReminders } from "./launch-purchase";

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  prismaMock.launchPurchase.findMany.mockReset();
  prismaMock.launchPurchase.findUnique.mockReset();
  prismaMock.launchPurchase.updateMany.mockReset();
  prismaMock.launchPurchase.update.mockReset();
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.NEXT_PUBLIC_BASE_URL = "https://cerpamedia.com";
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.EMAIL_REPLY_TO;
});

describe("sendDueLaunchSetupReminders", () => {
  it("sends one reminder to a buyer who has not booked after two business days", async () => {
    prismaMock.launchPurchase.findMany.mockResolvedValue([
      {
        id: "lp_due",
        buyerName: "Avery Buyer",
        buyerEmail: "avery@example.com",
        bookingToken: "due-token-due-token-due-token-due-token",
        bookingId: null,
        welcomeReminderSentAt: null,
        createdAt: new Date("2026-10-21T18:00:00.000Z"),
      },
      {
        id: "lp_early",
        buyerName: "Riley Client",
        buyerEmail: "riley@example.com",
        bookingToken: "early-token-early-token-early-token-xyz",
        bookingId: null,
        welcomeReminderSentAt: null,
        createdAt: new Date("2026-10-23T18:00:00.000Z"),
      },
    ]);
    prismaMock.launchPurchase.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.launchPurchase.update.mockResolvedValue({});

    const result = await sendDueLaunchSetupReminders(new Date("2026-10-23T18:00:00.000Z"));

    expect(result).toEqual({ sent: 1, failed: 0 });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const email = sendMock.mock.calls[0][0];
    expect(email.to).toBe("avery@example.com");
    expect(email.from).toBe("CerpaMedia <info@cerpamedia.com>");
    expect(email.replyTo).toBe("cerpamedia@gmail.com");
    expect(email.subject).toBe("Your AI Teammate Launch setup session is still open");
    expect(email.html).toContain("https://cerpamedia.com/launch/setup/due-token-due-token-due-token-due-token");
    expect(email.text).toContain("Reply to this email or call (943) 248-7410.");
    expect(email.html).not.toMatch(/\$99|sms|text message/i);
    expect(prismaMock.launchPurchase.update).toHaveBeenCalledWith({
      where: { id: "lp_due" },
      data: {
        welcomeReminderSentAt: expect.any(Date),
        welcomeReminderClaimedAt: null,
      },
    });
  });
});
