import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-bg py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-text mb-6">
                <svg
                  className="w-10 h-10 text-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-text tracking-tight">
                Booking Confirmed!
              </h1>
              <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                Thank you for booking your Technology Strategy Call. Your payment has been processed successfully.
              </p>
            </div>

            <div className="border border-border p-8 mb-8 text-left">
              <h2 className="text-2xl font-semibold text-text mb-4">What Happens Next?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border border-text flex items-center justify-center text-text text-sm font-medium">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Check Your Email</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      You'll receive a confirmation email with all the details of your booking, including the date, time, and platform preference.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border border-text flex items-center justify-center text-text text-sm font-medium">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Meeting Link Coming Soon</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      Roger Cerpa will send you the Zoom or Microsoft Teams meeting link shortly before your scheduled session.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border border-text flex items-center justify-center text-text text-sm font-medium">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Prepare for Your Call</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed mb-3">
                      To make the most of your 30-45 minute session, come prepared with:
                    </p>
                    <ul className="space-y-2 text-[15px] text-text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-text">•</span>
                        <span>A brief overview of your business and current technology setup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-text">•</span>
                        <span>Specific challenges or opportunities you'd like to discuss</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-text">•</span>
                        <span>Any questions about technology integration for your business</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border border-text flex items-center justify-center text-text text-sm font-medium">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Receive Your Summary</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      Within 24-48 hours after your call, you'll receive an email summary with 3-5 key opportunities and recommended next steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-subtle border border-border p-6 mb-8">
              <p className="text-text-muted text-[15px] mb-2">
                Need to reschedule or have questions?
              </p>
              <a
                href="mailto:cerpamedia@gmail.com"
                className="text-text hover:underline font-medium"
              >
                cerpamedia@gmail.com
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="border border-border text-text px-8 py-3.5 text-[15px] font-medium hover:bg-bg-subtle transition-colors"
              >
                Return to Home
              </Link>
              <Link
                href="/services"
                className="border border-border text-text px-8 py-3.5 text-[15px] font-medium hover:bg-bg-subtle transition-colors"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
