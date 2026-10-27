import { describe, expect, it } from "vitest";
import { activeMobileTab, MOBILE_TABS, shouldShowMobileTabBar } from "./mobile-tabs";

describe("mobile tab bar", () => {
  it("highlights nested routes on the matching tab", () => {
    expect(activeMobileTab("/")).toBe("home");
    expect(activeMobileTab("/index")).toBe("home");
    expect(activeMobileTab("/index/")).toBe("home");
    expect(activeMobileTab("/services")).toBe("services");
    expect(activeMobileTab("/services/")).toBe("services");
    expect(activeMobileTab("/services/other")).toBe("services");
    expect(activeMobileTab("/services/ai-teammate-launch")).toBe("launch");
    expect(activeMobileTab("/services/ai-teammate-launch/details")).toBe("launch");
    expect(activeMobileTab("/insights")).toBe("insights");
    expect(activeMobileTab("/insights/a-post")).toBe("insights");
    expect(activeMobileTab("/contact")).toBeNull();
    expect(activeMobileTab("/consult")).toBeNull();
  });

  it("hides on admin and token-gated launch setup", () => {
    expect(shouldShowMobileTabBar("/")).toBe(true);
    expect(shouldShowMobileTabBar("/services")).toBe(true);
    expect(shouldShowMobileTabBar("/insights/a-post")).toBe(true);
    expect(shouldShowMobileTabBar("/consult")).toBe(true);
    expect(shouldShowMobileTabBar("/admin")).toBe(false);
    expect(shouldShowMobileTabBar("/admin/bookings")).toBe(false);
    expect(shouldShowMobileTabBar("/admin/login")).toBe(false);
    expect(shouldShowMobileTabBar("/launch/setup/token")).toBe(false);
  });

  it("does not put Strategy Call or a price on the bar", () => {
    const labels = MOBILE_TABS.map((tab) => tab.label).join(" ");
    const hrefs = MOBILE_TABS.map((tab) => tab.href);
    expect(labels).not.toMatch(/strategy call/i);
    expect(labels).not.toMatch(/small business|SMB|\$99/i);
    expect(hrefs).not.toContain("/consult");
    expect(hrefs.some((href) => href.includes("/launch"))).toBe(false);
  });
});
