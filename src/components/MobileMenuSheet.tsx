"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileNav } from "@/components/MobileNavProvider";
import { shouldShowMobileTabBar } from "@/components/mobile-tabs";

const MENU_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/insights", label: "Insights" },
  { href: "/consult", label: "Strategy Call" },
  { href: "/contact", label: "Contact" },
] as const;

const linkClass =
  "flex min-h-11 items-center px-3 py-2 text-[15px] text-text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

export default function MobileMenuSheet() {
  const pathname = usePathname();
  const { open, close } = useMobileNav();
  const sheetRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const show = shouldShowMobileTabBar(pathname);

  useEffect(() => {
    if (!show) return;
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, show]);

  useEffect(() => {
    if (!show) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    if (open) {
      sheet.inert = false;
      sheet.querySelector<HTMLElement>("a")?.focus();
    } else {
      if (wasOpen.current) {
        document.getElementById("mobile-tab-menu")?.focus();
      }
      sheet.inert = true;
    }
    wasOpen.current = open;
  }, [open, show]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) close();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [close]);

  useEffect(() => {
    if (!open || !show) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show, close]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[55] overflow-hidden bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] md:hidden ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={open ? undefined : true}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <nav
        ref={sheetRef}
        id="mobile-nav-menu"
        aria-label="Menu"
        className={`absolute inset-x-0 bottom-0 border-t border-border bg-white transition-transform duration-200 ease-out motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-h-[calc(100dvh-3.5rem-1px-env(safe-area-inset-bottom))] overflow-y-auto px-4 py-3">
          <ul className="flex flex-col">
            {MENU_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass} onClick={close}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
