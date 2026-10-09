"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`bg-white border-b border-border sticky top-0 z-50 transition-all duration-300 ${
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-muted hover:text-text"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-4 space-y-3 bg-white">
            <Link
              href="/services"
              className="block px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/insights"
              className="block px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Insights
            </Link>
            <Link
              href="/consult"
              className="block px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Strategy Call
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-text-muted hover:text-text rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
