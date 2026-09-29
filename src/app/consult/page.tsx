import Link from "next/link";

const paymentLink =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL ||
  process.env.STRIPE_PAYMENT_LINK_URL;

export default function ConsultPage() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block border border-border px-3 py-1 mb-6">
              <span className="text-[11px] font-medium text-text uppercase tracking-wider">Limited Availability</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
              Technology Strategy Call
            </h1>
            <p className="text-2xl md:text-3xl font-medium mb-4 text-text">
              $99 · 30–45 minutes
            </p>
            <p className="text-lg text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              Expert technology guidance tailored to your business needs. One focused session to identify opportunities and next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-colors"
                >
                  Pay $99 to Get Started
                </a>
              ) : (
                <div className="border border-border p-6 text-left">
                  <p className="text-text font-medium mb-2">Payment link coming soon</p>
                  <p className="text-sm text-text-muted mb-3">
                    Contact us to inquire about the Technology Strategy Call
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:cerpamedia@gmail.com"
                      className="text-text hover:underline font-medium"
                    >
                      cerpamedia@gmail.com
                    </a>
                    <a
                      href="tel:+19432487410"
                      className="text-text hover:underline font-medium"
                    >
                      (943) 248-7410
                    </a>
                  </div>
                </div>
              )}
              <Link
                href="/contact"
                className="text-text-muted px-8 py-3.5 text-[15px] font-medium hover:text-text transition-colors"
              >
                Have Questions?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
              What's Included
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="border border-border p-8">
              <h3 className="text-xl font-medium mb-3 text-text">30–45 Minute Video Call</h3>
              <p className="text-[15px] text-text-muted leading-relaxed">
                Live session via Zoom or Microsoft Teams, scheduled at your convenience
              </p>
            </div>

            <div className="border border-border p-8">
              <h3 className="text-xl font-medium mb-3 text-text">Written Summary</h3>
              <p className="text-[15px] text-text-muted leading-relaxed">
                Email summary within 24–48 hours highlighting 3–5 opportunities and recommended next steps
              </p>
            </div>

            <div className="border border-border p-8">
              <h3 className="text-xl font-medium mb-3 text-text">Expert Guidance</h3>
              <p className="text-[15px] text-text-muted leading-relaxed">
                Direct access to Roger Cerpa's experience in technology integration for small businesses
              </p>
            </div>

            <div className="border border-border p-8">
              <h3 className="text-xl font-medium mb-3 text-text">Prepaid & Standalone</h3>
              <p className="text-[15px] text-text-muted leading-relaxed">
                Pay $99 upfront before scheduling. This is a standalone service, not credited toward discovery or project work
              </p>
            </div>
          </div>

          <div className="bg-bg-subtle border border-border p-8">
            <h3 className="text-lg font-medium mb-4 text-text">
              What's Not Included
            </h3>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start gap-3">
                <span className="text-text-muted">•</span>
                <span className="text-[15px] leading-relaxed">Full statement of work (SOW) or detailed project proposal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-text-muted">•</span>
                <span className="text-[15px] leading-relaxed">Implementation or hands-on work</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-text-muted">•</span>
                <span className="text-[15px] leading-relaxed">Credit toward discovery or future projects</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-text-muted">•</span>
                <span className="text-[15px] leading-relaxed">Follow-up calls (available separately if needed)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-bg-subtle py-20 md:py-24 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-text">Pay $99</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Complete payment through our secure Stripe checkout. Your session is prepaid before scheduling.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-text">We Schedule Your Call</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  After payment, Roger will contact you directly to find a convenient time for your Zoom or Microsoft Teams session.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-text">30–45 Minute Strategy Session</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Join the call to discuss your technology challenges, opportunities, and goals. Come prepared with questions and context about your business.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-text">Receive Your Summary</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Within 24–48 hours, you'll receive a short email summary highlighting 3–5 key opportunities and recommended next steps for your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Take the first step toward better technology decisions for your business. Book your Technology Strategy Call today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-charcoal px-8 py-3.5 text-[15px] font-medium hover:bg-gray-100 transition-colors"
                >
                  Pay $99 Now
                </a>
              ) : (
                <div className="bg-white border border-border p-6 text-left">
                  <p className="text-text font-medium mb-2">Payment link coming soon</p>
                  <p className="text-sm text-text-muted mb-3">
                    Contact us to inquire
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:cerpamedia@gmail.com"
                      className="text-text hover:underline font-medium"
                    >
                      cerpamedia@gmail.com
                    </a>
                    <a
                      href="tel:+19432487410"
                      className="text-text hover:underline font-medium"
                    >
                      (943) 248-7410
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-subtle py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-text mb-4">
            Have Questions?
          </h2>
          <p className="text-text-muted mb-6 text-[15px]">
            Not sure if this is right for you? Reach out and we'll help you decide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:cerpamedia@gmail.com"
              className="text-text hover:underline font-medium text-[15px]"
            >
              cerpamedia@gmail.com
            </a>
            <span className="text-border">•</span>
            <a
              href="tel:+19432487410"
              className="text-text hover:underline font-medium text-[15px]"
            >
              (943) 248-7410
            </a>
            <span className="text-border">•</span>
            <Link
              href="/contact"
              className="text-text hover:underline font-medium text-[15px]"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
