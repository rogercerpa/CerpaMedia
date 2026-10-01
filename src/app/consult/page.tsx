import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { BookingFlow } from "@/components/BookingFlow";

export default function ConsultPage() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
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
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-24 border-t border-border bg-bg-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingFlow />
        </div>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                What's Included
              </h2>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={70}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">30–45 Minute Video Call</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Live session via Zoom or Microsoft Teams, scheduled at your convenience
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Written Summary</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Email summary within 24–48 hours highlighting 3–5 opportunities and recommended next steps
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Expert Guidance</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Direct access to Roger Cerpa's experience in technology integration for small businesses
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Prepaid & Standalone</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Pay $99 upfront before scheduling. This is a standalone service, not credited toward discovery or project work
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
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
          </Reveal>
        </div>
      </section>

      <section className="bg-bg py-20 md:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                How It Works
              </h2>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={80}>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-text">Pick Your Time</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Choose from available slots that work with your schedule. All times shown in Eastern Time.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Share Your Info</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Provide your contact details, platform preference (Zoom or Microsoft Teams), and a brief note about what you'd like to discuss.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Pay $99 Securely</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Complete payment through Stripe's secure checkout. Your booking is confirmed immediately upon payment.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Join Your Call</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Roger will send you the meeting link shortly before your scheduled session. Come prepared with questions about your technology challenges and goals.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                    5
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-text">Receive Your Summary</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Within 24–48 hours after your call, you'll receive an email summary highlighting 3–5 key opportunities and recommended next steps for your business.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <section className="bg-bg-subtle py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal delay={100}>
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
          </Reveal>
        </div>
      </section>
    </div>
  );
}
