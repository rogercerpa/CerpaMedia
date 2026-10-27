"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMobileNav } from "@/components/MobileNavProvider";

export default function Navigation() {
  const { open: mobileMenuOpen, close: closeMobileMenu } = useMobileNav();
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && !wasOpen.current) {
      menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    }
    wasOpen.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeMobileMenu();
      document.getElementById("mobile-tab-menu")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <nav aria-label="Main" className={`bg-white border-b border-border sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "backdrop-blur-md bg-white/95 shadow-sm" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo/logo.svg"
                alt="CerpaMedia"
                width={160}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className="text-text-muted hover:text-text transition-colors text-[15px]">
              Services
            </Link>
            <Link href="/insights" className="text-text-muted hover:text-text transition-colors text-[15px]">
              Insights
            </Link>
            <Link href="/consult" className="text-text-muted hover:text-text transition-colors text-[15px]">
              Strategy Call
            </Link>
            <Link href="/contact" className="text-text-muted hover:text-text transition-colors text-[15px]">
              Contact
            </Link>
          </div>

        </div>
      </div>

      <div
        ref={menuRef}
        id="mobile-nav-menu"
        className={`md:hidden border-t border-border ${mobileMenuOpen ? "" : "hidden"}`}
      >
        <div className="max-h-[calc(100dvh-4rem-3.5rem-env(safe-area-inset-bottom))] overflow-y-auto px-4 py-4 space-y-3 bg-white">
          <Link
            href="/services"
            className="flex min-h-11 items-center px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            onClick={closeMobileMenu}
          >
            Services
          </Link>
          <Link
            href="/insights"
            className="flex min-h-11 items-center px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            onClick={closeMobileMenu}
          >
            Insights
          </Link>
          <Link
            href="/consult"
            className="flex min-h-11 items-center px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            onClick={closeMobileMenu}
          >
            Strategy Call
          </Link>
          <Link
            href="/contact"
            className="flex min-h-11 items-center px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            onClick={closeMobileMenu}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
