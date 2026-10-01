import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-bg py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-text-muted mb-6">
                <svg
                  className="w-10 h-10 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-text tracking-tight">
                Booking Cancelled
              </h1>
              <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                Your booking was not completed. No payment was processed.
              </p>
            </div>

            <div className="border border-border p-8 mb-8 text-left">
              <h2 className="text-2xl font-semibold text-text mb-4">What Now?</h2>
              
              <div className="space-y-6 text-[15px] text-text-muted">
                <p className="leading-relaxed">
                  Your selected time slot has been released and is available for others to book. 
                  If you'd like to try again, you can return to the booking page and select a new time.
                </p>
                
                <p className="leading-relaxed">
                  If you experienced any issues during the checkout process or have questions about 
                  the Technology Strategy Call, we're here to help.
                </p>
              </div>
            </div>

            <div className="bg-bg-subtle border border-border p-6 mb-8">
              <p className="text-text font-medium mb-3">Need Assistance?</p>
              <div className="flex flex-col gap-2 text-[15px]">
                <a
                  href="mailto:cerpamedia@gmail.com"
                  className="text-text-muted hover:text-text hover:underline"
                >
                  Email: cerpamedia@gmail.com
                </a>
                <a
                  href="tel:+19432487410"
                  className="text-text-muted hover:text-text hover:underline"
                >
                  Phone: (943) 248-7410
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consult"
                className="bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="border border-border text-text px-8 py-3.5 text-[15px] font-medium hover:bg-bg-subtle transition-colors"
              >
                Return to Home
              </Link>
              <Link
                href="/contact"
                className="border border-border text-text px-8 py-3.5 text-[15px] font-medium hover:bg-bg-subtle transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
