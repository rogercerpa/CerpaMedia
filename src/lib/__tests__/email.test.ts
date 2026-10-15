import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_EMAIL_FROM,
  DEFAULT_EMAIL_REPLY_TO,
  getEmailFrom,
  getEmailReplyTo,
} from "@/lib/email";

const originalFrom = process.env.CONTACT_FROM_EMAIL;
const originalReplyTo = process.env.EMAIL_REPLY_TO;

afterEach(() => {
  restoreEnv("CONTACT_FROM_EMAIL", originalFrom);
  restoreEnv("EMAIL_REPLY_TO", originalReplyTo);
});

describe("getEmailFrom", () => {
  it("defaults to the verified CerpaMedia address", () => {
    delete process.env.CONTACT_FROM_EMAIL;
    expect(getEmailFrom()).toBe(DEFAULT_EMAIL_FROM);
    expect(DEFAULT_EMAIL_FROM).toBe("CerpaMedia <info@cerpamedia.com>");
  });

  it("uses CONTACT_FROM_EMAIL when set", () => {
    process.env.CONTACT_FROM_EMAIL = "CerpaMedia <custom@cerpamedia.com>";
    expect(getEmailFrom()).toBe("CerpaMedia <custom@cerpamedia.com>");
  });

  it("trims CONTACT_FROM_EMAIL and ignores a blank value", () => {
    process.env.CONTACT_FROM_EMAIL = "  CerpaMedia <info@cerpamedia.com>  ";
    expect(getEmailFrom()).toBe("CerpaMedia <info@cerpamedia.com>");

    process.env.CONTACT_FROM_EMAIL = "   ";
    expect(getEmailFrom()).toBe(DEFAULT_EMAIL_FROM);
  });
});

describe("getEmailReplyTo", () => {
  it("defaults to cerpamedia@gmail.com", () => {
    delete process.env.EMAIL_REPLY_TO;
    expect(getEmailReplyTo()).toBe(DEFAULT_EMAIL_REPLY_TO);
    expect(DEFAULT_EMAIL_REPLY_TO).toBe("cerpamedia@gmail.com");
  });

  it("uses EMAIL_REPLY_TO when set", () => {
    process.env.EMAIL_REPLY_TO = "replies@cerpamedia.com";
    expect(getEmailReplyTo()).toBe("replies@cerpamedia.com");
  });

  it("trims EMAIL_REPLY_TO and ignores a blank value", () => {
    process.env.EMAIL_REPLY_TO = "  replies@cerpamedia.com  ";
    expect(getEmailReplyTo()).toBe("replies@cerpamedia.com");

    process.env.EMAIL_REPLY_TO = "   ";
    expect(getEmailReplyTo()).toBe(DEFAULT_EMAIL_REPLY_TO);
  });
});

function restoreEnv(name: "CONTACT_FROM_EMAIL" | "EMAIL_REPLY_TO", value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
