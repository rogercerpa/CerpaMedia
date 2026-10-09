import { describe, expect, it } from "vitest";
import {
  canGenerate,
  canServePublicDemo,
  publicDemoMode,
  visitorCanTriggerAi,
} from "@/lib/demo-safety";

describe("demo safety model", () => {
  it("never allows a visitor-triggered AI path", () => {
    expect(visitorCanTriggerAi()).toBe(false);
    const result = canGenerate({
      killSwitch: false,
      spendUsd: 0,
      capUsd: 5,
      isAdmin: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toMatch(/visitors cannot trigger/i);
    }
  });

  it("disables generation when the kill switch is on", () => {
    const result = canGenerate({
      killSwitch: true,
      spendUsd: 0,
      capUsd: 5,
      isAdmin: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(423);
      expect(result.error).toMatch(/kill switch/i);
    }
    expect(
      publicDemoMode({ killSwitch: true, spendUsd: 0, capUsd: 5 })
    ).toBe("replay");
  });

  it("falls back to replays when the daily cap is hit", () => {
    const result = canGenerate({
      killSwitch: false,
      spendUsd: 5,
      capUsd: 5,
      isAdmin: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(429);
      expect(result.error).toMatch(/cap/i);
    }
    expect(
      publicDemoMode({ killSwitch: false, spendUsd: 5.01, capUsd: 5 })
    ).toBe("replay");
  });

  it("hides demos from visitors unless Published and the public flag is on", () => {
    expect(
      canServePublicDemo({
        enabled: true,
        status: "draft",
        demosPublicEnabled: false,
      })
    ).toBe(false);
    expect(
      canServePublicDemo({
        enabled: true,
        status: "published",
        demosPublicEnabled: false,
      })
    ).toBe(false);
    expect(
      canServePublicDemo({
        enabled: true,
        status: "draft",
        demosPublicEnabled: true,
      })
    ).toBe(false);
    expect(
      canServePublicDemo({
        enabled: true,
        status: "published",
        demosPublicEnabled: true,
      })
    ).toBe(true);
  });

  it("allows admin generation under the cap with the kill switch off", () => {
    const result = canGenerate({
      killSwitch: false,
      spendUsd: 1.2,
      capUsd: 5,
      isAdmin: true,
    });
    expect(result).toEqual({ ok: true });
    expect(
      publicDemoMode({ killSwitch: false, spendUsd: 1.2, capUsd: 5 })
    ).toBe("samples");
  });
});
