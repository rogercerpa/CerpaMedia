import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CalendarBookingFlow } from "@/components/CalendarBookingFlow";

export default function ConsultPage() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <div className="inline-block border border-border px-3 py-1 mb-6">
                <span className="text-[11px] font-medium text-text uppercase tracking-wider">Limited slots · Roger schedules personally</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Walk away knowing what to fix first
              </h1>
              <p className="text-2xl md:text-3xl font-medium mb-4 text-text">
                $99 · 30–45 minutes on Zoom or Teams
              </p>
              <p className="text-lg text-text-muted mb-6 max-w-2xl mx-auto leading-relaxed">
                For small-business owners stuck with weak sites, scattered tools, or "we should automate this" — and no clear plan.
              </p>
              <p className="text-[15px] text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                Pay securely → Roger contacts you to schedule → after the call, get a written summary within 24–48 hours with <strong className="text-text">3–5 opportunities</strong> and <strong className="text-text">one recommended next step</strong>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-24 border-t border-border bg-bg-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CalendarBookingFlow />
        </div>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                What you get for $99
              </h2>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={70}>
            <div className="space-y-6 mb-16">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border-2 border-text flex items-center justify-center text-text font-medium text-sm mt-1">1</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-text">Focused working session</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      30–45 min with Roger on Zoom or Teams — your bottlenecks, not a sales monologue
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border-2 border-text flex items-center justify-center text-text font-medium text-sm mt-1">2</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-text">Opportunity map</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      3–5 practical ideas (web app, AI, automation, or "don't build yet")
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border-2 border-text flex items-center justify-center text-text font-medium text-sm mt-1">3</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-text">Priority order</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      What to tackle first so you don't boil the ocean
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border-2 border-text flex items-center justify-center text-text font-medium text-sm mt-1">4</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-text">Written summary</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      Email within 24–48 hours you can share with a partner or team
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border-2 border-text flex items-center justify-center text-text font-medium text-sm mt-1">5</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-text">Recommended next step</h3>
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      Discovery, DIY path, or wait — a clear decision, not a vague "let's stay in touch"
                    </p>
                  </div>
                </div>
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
                  <span className="text-[15px] leading-relaxed"><strong className="text-text">No credit</strong> toward discovery or future projects</span>
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
            <div className="space-y-8 mb-12">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 border-2 border-text flex items-center justify-center text-text font-medium text-sm">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-text">Pay $99 securely</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Stripe checkout on this page. Booking starts when payment clears.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Roger reaches out</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Usually by email or call within 1 business day to pick Zoom or Teams and a time (Eastern).
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
                  <h3 className="text-lg font-medium mb-2 text-text">Join the call</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Bring your biggest ops headaches and any "we should automate / rebuild / add AI" questions.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Get your summary</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Within 24–48 hours: 3–5 opportunities, priority order, and one recommended next step.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center border-t border-border pt-12">
              <p className="text-sm text-text-muted mb-6 max-w-2xl mx-auto leading-relaxed">
                After you pay, watch for Roger's email or call to schedule. This call is a <strong className="text-text">prepaid standalone</strong> service. The $99 fee is <strong className="text-text">not</strong> credited toward discovery or other project work, with one exception: <strong className="text-text">if you purchase AI Teammate Launch within 30 days of this call, the $99 comes off</strong>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>


      <section className="bg-bg-subtle py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal delay={100}>
            <h2 className="text-2xl font-semibold text-text mb-4">
              Not sure this is for you?
            </h2>
            <p className="text-text-muted mb-6 text-[15px] max-w-2xl mx-auto leading-relaxed">
              If you already know you need a full build, say so — we may point you to paid discovery instead. If you're unclear where tech helps, this $99 call is the right first step.
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
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
