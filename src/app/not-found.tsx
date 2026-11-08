import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Page not found — CerpaMedia" },
  description: "That page is not on CerpaMedia. Go back to the home page, services, or contact.",
  robots: { index: false, follow: true },
};

const recoveryLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="bg-bg">
      <section className="px-4 pb-24 pt-16 sm:px-6 md:pb-32 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-text-muted">404</p>
          <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-tight text-text md:text-6xl">
            Page not found
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-text-muted">
            That link does not go anywhere on CerpaMedia. Try one of these pages instead.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {recoveryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/"
                    ? "inline-block bg-cta px-8 py-3.5 text-[15px] font-medium text-cta-text transition-colors hover:bg-cta-hover"
                    : "inline-block border border-border px-8 py-3.5 text-[15px] font-medium text-text transition-colors hover:border-text"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
