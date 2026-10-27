/**
 * Phone tab bar destinations. Strategy Call (/consult) stays in the header
 * menu only — it is an optional fifth destination Roger can add later, and
 * this bar does not carry a price button.
 */
export const MOBILE_TABS = [
  { id: "home", label: "Home", href: "/" },
  { id: "services", label: "Services", href: "/services" },
  {
    id: "launch",
    label: "Launch",
    href: "/services/ai-teammate-launch",
    accessibleName: "AI Teammate Launch",
  },
  { id: "insights", label: "Insights", href: "/insights" },
] as const;

export type MobileTabId = (typeof MOBILE_TABS)[number]["id"];

export function shouldShowMobileTabBar(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
  if (pathname === "/launch" || pathname.startsWith("/launch/")) return false;
  return true;
}

export function activeMobileTab(pathname: string): MobileTabId | null {
  if (pathname === "/") return "home";
  if (
    pathname === "/services/ai-teammate-launch" ||
    pathname.startsWith("/services/ai-teammate-launch/")
  ) {
    return "launch";
  }
  if (pathname === "/services" || pathname.startsWith("/services/")) return "services";
  if (pathname === "/insights" || pathname.startsWith("/insights/")) return "insights";
  return null;
}

