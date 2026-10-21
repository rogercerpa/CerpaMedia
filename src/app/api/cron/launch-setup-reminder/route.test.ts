import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendDue = vi.hoisted(() => vi.fn());

vi.mock("@/lib/launch-purchase", () => ({
  sendDueLaunchSetupReminders: sendDue,
}));

import { GET } from "./route";

const original = process.env.CRON_SECRET;

beforeEach(() => {
  sendDue.mockReset();
  sendDue.mockResolvedValue({ sent: 1, failed: 0 });
  process.env.CRON_SECRET = "cron-test-secret";
});

afterEach(() => {
  if (original === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = original;
});

describe("launch setup reminder cron", () => {
  it("rejects calls without the cron secret", async () => {
    const missing = await GET(new NextRequest("https://cerpamedia.com/api/cron/launch-setup-reminder"));
    expect(missing.status).toBe(401);
    expect(sendDue).not.toHaveBeenCalled();

    delete process.env.CRON_SECRET;
    const unconfigured = await GET(
      new NextRequest("https://cerpamedia.com/api/cron/launch-setup-reminder", {
        headers: { authorization: "Bearer cron-test-secret" },
      })
    );
    expect(unconfigured.status).toBe(401);
    expect(sendDue).not.toHaveBeenCalled();
  });

  it("sends due reminders for an authorized daily run", async () => {
    const response = await GET(
      new NextRequest("https://cerpamedia.com/api/cron/launch-setup-reminder", {
        headers: { authorization: "Bearer cron-test-secret" },
      })
    );
    expect(response.status).toBe(200);
    expect(sendDue).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ sent: 1, failed: 0 });
  });

  it("returns 500 when a reminder send fails so the cron can retry", async () => {
    sendDue.mockResolvedValue({ sent: 0, failed: 1 });
    const response = await GET(
      new NextRequest("https://cerpamedia.com/api/cron/launch-setup-reminder", {
        headers: { authorization: "Bearer cron-test-secret" },
      })
    );
    expect(response.status).toBe(500);
  });
});
