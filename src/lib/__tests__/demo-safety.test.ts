import { describe, expect, it } from "vitest";
import {
  canServePublicDemo,
  publicDemoMode,
  visitorCanTriggerAi,
} from "@/lib/demo-safety";

describe("demo safety model", () => {
  it("never allows a visitor-triggered AI path", () => {
    expect(visitorCanTriggerAi()).toBe(false);
  });

  it("shows replay only when the kill switch is on", () => {
    expect(publicDemoMode({ killSwitch: true })).toBe("replay");
    expect(publicDemoMode({ killSwitch: false })).toBe("samples");
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
});
