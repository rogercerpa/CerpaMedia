"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    </nav>
  );
}
