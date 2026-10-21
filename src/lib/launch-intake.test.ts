import { describe, expect, it } from "vitest";
import {
  LAUNCH_IN_PERSON,
  LAUNCH_VIRTUAL,
  bookingFieldsFromIntake,
  clientReferenceFor,
  labeledIntakeLines,
  reviewIntake,
  visibleSections,
} from "./launch-intake";

const reference = "ATL-2026-ABC123";

function complete(overrides: Record<string, string | string[]> = {}) {
  return {
    q1: "Northside Roofing",
    q2: "Avery Buyer, owner",
    q3: "avery@example.com",
    q4: "4045550199",
    q5: "Email",
    q6: "We repair roofs for homeowners.",
    q7: "Only me",
    q9: "Writing quotes · 6 times a week · 20 minutes each",
    q12: "Google Workspace / Gmail",
    q17a: "No",
    q19: "No",
    q21: LAUNCH_IN_PERSON,
    q24: "No",
    ...overrides,
  };
}

describe("launch intake", () => {
  it("builds a stable client reference and locks the purchase email", () => {
    const ref = clientReferenceFor({
      id: "cmvi83va9000008l4i5mjufnk",
      createdAt: new Date("2026-10-21T15:00:00.000Z"),
    });
    expect(ref).toBe("ATL-2026-MJUFNK");

    const review = reviewIntake({
      answers: complete({ q0: "changed", q3: "other@example.com" }),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(review.errors).toEqual({});
    expect(review.answers.q0).toBe(reference);
    expect(review.answers.q3).toBe("avery@example.com");
  });

  it("requires the virtual platform only for a virtual launch", () => {
    const inPerson = reviewIntake({
      answers: complete(),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(inPerson.errors).toEqual({});
    expect(bookingFieldsFromIntake(inPerson.answers).platformPref).toBe(
      "In person (Woodstock, GA area)"
    );
    expect(visibleSections(inPerson.answers).map((section) => section.id)).not.toContain("F");

    const virtual = reviewIntake({
      answers: complete({ q21: LAUNCH_VIRTUAL }),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(virtual.errors.q22).toBe("This question is required.");
    expect(visibleSections(virtual.answers).map((section) => section.id)).toContain("F");

    const zoom = reviewIntake({
      answers: complete({ q21: LAUNCH_VIRTUAL, q22: "Zoom" }),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(zoom.errors).toEqual({});
    expect(bookingFieldsFromIntake(zoom.answers).platformPref).toBe("Zoom");
  });

  it("rejects more than three helpful tasks, card numbers, and passwords", () => {
    const tooMany = reviewIntake({
      answers: complete({
        q10: ["Inbox triage", "Morning brief", "Quote drafts", "Social drafts"],
      }),
      mode: "draft",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(tooMany.errors.q10).toBe("Please pick up to 3.");

    const card = reviewIntake({
      answers: complete({ q8: "4111 1111 1111 1111" }),
      mode: "draft",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(card.errors.q8).toBe("Please don't enter card numbers.");

    const secret = reviewIntake({
      answers: complete({ q25: "password: hunter2" }),
      mode: "draft",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(secret.errors.q25).toBe("Please don't enter passwords or keys.");
  });

  it("hides follow-ups until the parent answer needs them and labels answers for admin", () => {
    const hidden = reviewIntake({
      answers: complete({ q19b: "patient names", q24b: "2026-01-02" }),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(hidden.answers.q19b).toBeUndefined();
    expect(hidden.answers.q24b).toBeUndefined();

    const shown = reviewIntake({
      answers: complete({
        q19: "Not sure",
        q19b: "Some invoices include account numbers. I will not paste them.",
        q24: "Yes",
        q24b: "2026-03-04",
        q13: ["QuickBooks", "Other"],
        q13Other: "ServiceTitan",
      }),
      mode: "submit",
      clientReference: reference,
      buyerEmail: "avery@example.com",
    });
    expect(shown.errors).toEqual({});
    const lines = labeledIntakeLines(shown.answers);
    expect(lines.find((line) => line.label.startsWith("If yes or not sure"))?.value).toContain(
      "account numbers"
    );
    expect(lines.find((line) => line.label === "Other tools you use")?.value).toBe(
      "QuickBooks · Other: ServiceTitan"
    );
    expect(lines.find((line) => line.label === "If yes, about what date?")?.value).toBe("2026-03-04");
  });

  it("uses the intake email error text", () => {
    const review = reviewIntake({
      answers: complete({ q3: "not-an-email" }),
      mode: "section",
      sectionId: "A",
      clientReference: reference,
      buyerEmail: null,
    });
    expect(review.errors.q3).toBe("Please enter a valid email.");
  });
});
