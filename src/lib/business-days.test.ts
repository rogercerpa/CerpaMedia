import { describe, expect, it } from "vitest";
import { addEasternBusinessDays, isLaunchReminderDue, purchasesNeedingReminder } from "./business-days";

describe("Eastern business days", () => {
  it("adds two business days and skips the weekend", () => {
    const wednesday = new Date("2026-10-21T18:00:00.000Z");
    expect(addEasternBusinessDays(wednesday, 2).toISOString()).toBe("2026-10-23T18:00:00.000Z");

    const friday = new Date("2026-10-23T19:00:00.000Z");
    expect(addEasternBusinessDays(friday, 2).toISOString()).toBe("2026-10-27T19:00:00.000Z");

    const saturday = new Date("2026-10-24T15:00:00.000Z");
    expect(addEasternBusinessDays(saturday, 2).toISOString()).toBe("2026-10-27T15:00:00.000Z");
  });

  it("selects unbooked purchases only after the deadline", () => {
    const createdAt = new Date("2026-10-21T18:00:00.000Z");
    const row = {
      id: "lp_1",
      createdAt,
      bookingId: null,
      welcomeReminderSentAt: null,
      buyerEmail: "avery@example.com",
    };

    expect(isLaunchReminderDue(createdAt, new Date("2026-10-23T17:59:00.000Z"))).toBe(false);
    expect(purchasesNeedingReminder([row], new Date("2026-10-23T17:59:00.000Z"))).toEqual([]);
    expect(purchasesNeedingReminder([row], new Date("2026-10-23T18:00:00.000Z"))).toEqual([row]);
    expect(
      purchasesNeedingReminder(
        [{ ...row, bookingId: "bk_1" }],
        new Date("2026-10-23T18:00:00.000Z")
      )
    ).toEqual([]);
    expect(
      purchasesNeedingReminder(
        [{ ...row, welcomeReminderSentAt: new Date("2026-10-23T18:05:00.000Z") }],
        new Date("2026-10-24T18:00:00.000Z")
      )
    ).toEqual([]);
  });
});
