import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Technology that helps your business operate
              </h1>
              <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed">
                Strategic web development, AI integration, and automation consulting for small businesses
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/consult"
                  className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  Book $99 call
                </Link>
                <Link
                  href="/contact"
                  className="inline-block text-text-muted px-8 py-3.5 text-[15px] font-medium hover:text-text transition-colors"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-16 md:py-20 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-sm uppercase tracking-wider text-text-muted font-medium mb-3">
                How we work
              </h2>
            </div>
          </Reveal>
          <Reveal stagger staggerDelay={60}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">Paid discovery first</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Start with a paid discovery phase, then fixed SOW for the build
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">You own everything</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  All GitHub repos, hosting accounts, and third-party service access stay yours
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">Practical tech, no hype</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Technology choices driven by what your business actually needs
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                What we do
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                Technology services designed to help small businesses work more efficiently
              </p>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={80}>
            <div className="space-y-6">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Web & Mobile Applications</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Custom websites, web applications, and mobile apps built to meet your business requirements. Responsive design, modern tech stack, hosted where you want.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">AI Integration</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Practical AI implementation guidance and integration. We help you identify where AI makes sense for your operations and build solutions that deliver measurable value.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Automation & Process</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Streamline repetitive tasks and improve workflows through strategic automation. Process analysis, tool selection, and implementation that reduces manual work.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Strategy Consulting</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Expert guidance on technology decisions, architecture, and roadmap planning. One-on-one sessions to identify opportunities and define actionable next steps.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block border border-white/20 px-3 py-1 mb-4">
                  <span className="text-[11px] font-medium text-white uppercase tracking-wider">New offering</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
                  Technology Strategy Call
                </h2>
                <p className="text-xl text-white/90 mb-2">
                  $99 · 30–45 minutes
                </p>
                <p className="text-[15px] text-white/70 mb-8 leading-relaxed">
                  One-on-one expert guidance session via Zoom or Teams. Walk away with 3–5 actionable opportunities and a written summary within 24–48 hours.
                </p>
                <Link
                  href="/consult"
                  className="inline-block bg-white text-charcoal px-8 py-3.5 text-[15px] font-medium hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Learn more
                </Link>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                  <p className="text-[15px] text-white/80 leading-relaxed">
                    Prepaid standalone service, not credited toward project work
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                  <p className="text-[15px] text-white/80 leading-relaxed">
                    Scheduled directly with Roger Cerpa after payment
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                  <p className="text-[15px] text-white/80 leading-relaxed">
                    Email summary highlighting key opportunities and recommended next steps
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-semibold text-text mb-6 tracking-tight">
              Ready to move forward?
            </h2>
            <p className="text-lg text-text-muted mb-10 leading-relaxed">
              Book a strategy call or reach out to discuss your project
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consult"
                className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Book $99 call
              </Link>
              <Link
                href="/contact"
                className="inline-block text-text-muted px-8 py-3.5 text-[15px] font-medium hover:text-text transition-colors"
              >
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
