import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());
const headerState = vi.hoisted(() => ({ ip: "203.0.113.10" }));

vi.mock("resend", () => ({
  Resend: class Resend {
    emails = { send: sendMock };
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? headerState.ip : null),
  }),
}));

import { submitContactForm } from "./contact";

const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
};

let ipOctet = 20;

function validSubmission(overrides: Record<string, string> = {}) {
  return {
    name: "Jane Doe",
    email: "jane@example.com",
    company: "Doe Studio",
    service: "AI integration",
    message: "We need help sorting out our tools and a simple website.",
    website: "",
    ...overrides,
  };
}

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  headerState.ip = `203.0.113.${ipOctet++}`;
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "cerpamedia@gmail.com";
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.EMAIL_REPLY_TO;
});

afterEach(() => {
  restoreEnv("RESEND_API_KEY", originalEnv.RESEND_API_KEY);
  restoreEnv("CONTACT_TO_EMAIL", originalEnv.CONTACT_TO_EMAIL);
  restoreEnv("CONTACT_FROM_EMAIL", originalEnv.CONTACT_FROM_EMAIL);
  restoreEnv("EMAIL_REPLY_TO", originalEnv.EMAIL_REPLY_TO);
});

describe("submitContactForm emails", () => {
  it("sends Roger a notice and the submitter a confirmation after a valid submission", async () => {
    const result = await submitContactForm(validSubmission());

    expect(result).toEqual({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    });
    expect(sendMock).toHaveBeenCalledTimes(2);

    const notice = sendMock.mock.calls[0][0];
    const confirmation = sendMock.mock.calls[1][0];

    expect(notice.from).toBe("CerpaMedia <info@cerpamedia.com>");
    expect(notice.to).toBe("cerpamedia@gmail.com");
    expect(notice.replyTo).toBe("jane@example.com");
    expect(notice.subject).toBe("New Contact Form Submission from Jane Doe");
    expect(notice.html).toContain("Reply to Jane Doe");
    expect(notice.html).toContain("mailto:jane@example.com");
    expect(notice.html).toContain("Doe Studio");
    expect(notice.html).toContain("AI integration");
    expect(notice.text).toContain("We need help sorting out our tools");
    expect(notice.text.length).toBeGreaterThan(40);

    expect(confirmation.from).toBe("CerpaMedia <info@cerpamedia.com>");
    expect(confirmation.to).toBe("jane@example.com");
    expect(confirmation.replyTo).toBe("cerpamedia@gmail.com");
    expect(confirmation.subject).toBe("We got your message, Jane");
    expect(confirmation.html).toContain("within 1 business day by email or phone");
    expect(confirmation.html).toContain("Roger Cerpa, CerpaMedia");
    expect(confirmation.html).toContain("CerpaMedia LLC, Woodstock, GA");
    expect(confirmation.html).toContain("https://cerpamedia.com");
    expect(confirmation.html).toContain("We need help sorting out our tools");
    expect(confirmation.html).not.toMatch(/sms|text message|\$99/i);
    expect(confirmation.text).toContain("Roger Cerpa, CerpaMedia");
  });

  it("uses configured from, reply-to, and recipient addresses", async () => {
    process.env.CONTACT_FROM_EMAIL = "CerpaMedia <custom@cerpamedia.com>";
    process.env.EMAIL_REPLY_TO = "replies@cerpamedia.com";
    process.env.CONTACT_TO_EMAIL = "roger@cerpamedia.com";

    const result = await submitContactForm(
      validSubmission({ name: "Mary Jane Watson", email: "mary@example.com" })
    );

    expect(result.success).toBe(true);
    const notice = sendMock.mock.calls[0][0];
    const confirmation = sendMock.mock.calls[1][0];
    expect(notice.from).toBe("CerpaMedia <custom@cerpamedia.com>");
    expect(notice.to).toBe("roger@cerpamedia.com");
    expect(confirmation.from).toBe("CerpaMedia <custom@cerpamedia.com>");
    expect(confirmation.replyTo).toBe("replies@cerpamedia.com");
    expect(confirmation.subject).toBe("We got your message, Mary");
  });

  it("escapes user content in both sent emails", async () => {
    const result = await submitContactForm(
      validSubmission({
        name: "Tom &amp; Jerry",
        email: "tom@example.com",
        company: "A &lt; B LLC",
        message:
          "Hello &lt;script&gt;alert(1)&lt;/script&gt; please contact me about the project timeline.",
      })
    );

    expect(result.success).toBe(true);
    for (const call of sendMock.mock.calls) {
      const html = call[0].html as string;
      expect(html).toContain("Tom &amp; Jerry");
      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toMatch(/<script[\s>]/i);
      expect(html).not.toMatch(/<img[\s>]/i);
    }
    const confirmation = sendMock.mock.calls[1][0];
    expect(confirmation.html).toContain("A &lt; B LLC");
  });

  it("does not send when validation or spam checks fail", async () => {
    const cases = [
      validSubmission({ website: "https://spam.example" }),
      validSubmission({ email: "not-an-email" }),
      validSubmission({ message: "too short" }),
      validSubmission({ name: "Bcdfg Smith" }),
      validSubmission({ email: "a.b.c.d.e@example.com" }),
    ];

    for (const submission of cases) {
      headerState.ip = `203.0.113.${ipOctet++}`;
      sendMock.mockClear();
      const result = await submitContactForm(submission);
      expect(result.success).toBe(false);
      expect(sendMock).not.toHaveBeenCalled();
    }
  });

  it("does not send when the contact API key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await submitContactForm(validSubmission());
    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("does not send a confirmation when the notice to Roger fails", async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: "rejected" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await submitContactForm(validSubmission());

    expect(result.success).toBe(false);
    expect(sendMock).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it("still accepts the submission when the confirmation email fails", async () => {
    sendMock
      .mockResolvedValueOnce({ data: { id: "notice" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "mailbox full" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await submitContactForm(validSubmission());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalled();
    expect(String(errorSpy.mock.calls[0][0])).toContain("contact confirmation");
    errorSpy.mockRestore();

    headerState.ip = `203.0.113.${ipOctet++}`;
    sendMock.mockReset();
    sendMock
      .mockResolvedValueOnce({ data: { id: "notice" }, error: null })
      .mockRejectedValueOnce(new Error("timeout"));
    const throwSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const thrown = await submitContactForm(validSubmission({ email: "other@example.com" }));
    expect(thrown.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(2);
    throwSpy.mockRestore();
  });

  it("stops sending after the contact rate limit", async () => {
    headerState.ip = "198.51.100.77";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await submitContactForm(validSubmission());
      expect(result.success).toBe(true);
    }

    sendMock.mockClear();
    const blocked = await submitContactForm(validSubmission());
    expect(blocked.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
