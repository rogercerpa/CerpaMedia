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

/**
 * Next prerenders `/` with canonical parts ["", "index"], so the first
 * usePathname() value on a fresh load is `/index`, not `/`.
 */
function normalizePathname(pathname: string): string {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return trimmed === "/index" ? "/" : trimmed;
}

export function activeMobileTab(pathname: string): MobileTabId | null {
  const path = normalizePathname(pathname);
  if (path === "/") return "home";
  if (
    path === "/services/ai-teammate-launch" ||
    path.startsWith("/services/ai-teammate-launch/")
  ) {
    return "launch";
  }
  if (path === "/services" || path.startsWith("/services/")) return "services";
  if (path === "/insights" || path.startsWith("/insights/")) return "insights";
  return null;
}

