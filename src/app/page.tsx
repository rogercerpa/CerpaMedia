import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getServiceBySlug, fallbackFeaturedService } from "@/lib/services";

export default async function Home() {
  // Fetch AI Teammate Launch service from DB with fallback
  const featured = await getServiceBySlug("ai-teammate-launch") || fallbackFeaturedService;
  
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Stop losing hours to tools that don't talk to each other.
              </h1>
              <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed">
                CerpaMedia helps small businesses get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and <strong className="text-text">you own the accounts and code.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/consult"
                  className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  Book the $99 Strategy Call
                </Link>
                <a
                  href="mailto:cerpamedia@gmail.com"
                  className="inline-block text-text-muted px-8 py-3.5 text-[15px] font-medium hover:text-text transition-colors"
                >
                  Or email Roger
                </a>
              </div>
              <div className="mt-8 pt-6 border-t border-border max-w-2xl mx-auto">
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">New:</strong> Get two AI teammates working in 14 days. <Link href={featured.ctaUrl} className="text-text hover:underline font-medium">{featured.title.replace(/Two AI teammates set up and saving you hours every week/i, 'AI Teammate Launch')}</Link> — {featured.priceLabel.split('·')[0].trim()} for the first 5 clients.
                </p>
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
                <h3 className="text-[15px] font-medium text-text mb-2">Clarity before code</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Paid discovery maps what to build (and what not to). Then a fixed statement of work with milestones — so you're not buying an open-ended project.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">You own the system</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  GitHub, hosting, domain, database, and third-party accounts stay in <em>your</em> name. We're a collaborator, not a landlord.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">Practical over trendy</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  We recommend what your business will actually use next quarter — not a slide deck of buzzwords.
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
                What changes for your business
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                Practical tech for small businesses that need less friction — not more software
              </p>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={80}>
            <div className="space-y-6">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Apps that run the business</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Customer portals, intake, scheduling, and ops tools built around how you actually work — not a brochure site that sits still.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">AI that earns its keep</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  We find where AI saves real time (or money) in <em>your</em> workflow — then integrate only what pays off. No science projects.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Fewer manual loops</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Cut copy-paste, reminders, and handoffs. Process first, tools second — so automation sticks.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">A plan before you spend</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  One focused call: what's broken, what's worth fixing, and what to do next — written up within 24–48 hours.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-24 md:py-32 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                Tools that actually buy back hours
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                The right stack doesn't add complexity — it gives you time back and keeps you in control. Pick and try your own, or we'll implement it for you.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mb-16">
              <h3 className="text-xl font-medium text-text mb-6 text-center">What we look for</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text mb-2">Talks to your stack</p>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Connects with what you already use — no data silos or manual bridges
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text mb-2">Owner stays in control</p>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Your accounts, your access. Not locked in someone else's workspace
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text mb-2">Pays off this quarter</p>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Clear ROI in weeks — not a science project or a "maybe later" expense
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={80}>
            <div className="space-y-6 mb-12">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Automation</h3>
                <p className="text-[15px] text-text-muted leading-relaxed mb-2">
                  <strong className="text-text">Make</strong> (and peers like Zapier or n8n) — glue that runs without you babysitting. When a form submits, a row updates, or a payment hits, the next five steps just happen.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed mb-3">
                  <strong className="text-text">Outcome:</strong> fewer manual loops, fewer mistakes, and you're not the bottleneck.
                </p>
                <p className="text-[15px] text-text leading-relaxed">
                  Want it set up right? We'll map your process, build the flows, and hand you the keys — <Link href="/consult" className="underline hover:text-text-muted">book the $99 Strategy Call</Link> to start.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Knowledge</h3>
                <p className="text-[15px] text-text-muted leading-relaxed mb-2">
                  <strong className="text-text">Notion</strong> — the business brain the team can find. Documents, wikis, and databases that don't disappear into email threads or scattered drives.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed mb-3">
                  <strong className="text-text">Outcome:</strong> new hires onboard faster, answers live in one place, and you're not re-explaining the same process every week.
                </p>
                <p className="text-[15px] text-text leading-relaxed">
                  Or let us structure it for you — from templates to integrations. <Link href="/consult" className="underline hover:text-text-muted">Start with the Strategy Call.</Link>
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-3 text-text">Always-on agents</h3>
                <p className="text-[15px] text-text-muted leading-relaxed mb-2">
                  <strong className="text-text">Grok Bot / OpenAI Dots</strong> — work that keeps moving between meetings. Summarize transcripts, draft replies, update boards, track action items.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed mb-3">
                  <strong className="text-text">Outcome:</strong> less context-switching, more flow. The business doesn't stall when you're heads-down.
                </p>
                <p className="text-[15px] text-text leading-relaxed">
                  We integrate agents into your workflow — connecting Slack, CRM, and task boards so they actually do the work. <Link href="/consult" className="underline hover:text-text-muted">Let's talk.</Link>
                </p>
              </div>

              <div className="border border-border p-6 bg-bg">
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">Stack choice depends on your business.</strong> There's no one-size-fits-all list — just layers that work together and give you leverage. Explore on your own or get a clear plan from us before you commit.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="text-center">
              <p className="text-[15px] text-text-muted mb-6 max-w-2xl mx-auto leading-relaxed">
                Want buyer's guidance on what to pick? Check Insights for landscape comparisons. Ready to implement? Book the Strategy Call and we'll map your next step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/insights"
                  className="inline-block text-text hover:text-text-muted transition-colors font-medium text-[15px] underline"
                >
                  Read tool guides in Insights
                </Link>
                <span className="hidden sm:inline text-text-muted">·</span>
                <Link
                  href="/consult"
                  className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  Book the $99 Technology Strategy Call
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
                  Get clear in one call — not another endless tech chat
                </h2>
                <p className="text-[15px] text-white/90 mb-8 leading-relaxed">
                  For $99 you get a 30–45 minute Zoom or Teams session with Roger Cerpa, focused on <em>your</em> bottlenecks. Within 24–48 hours you receive a written summary: <strong>3–5 opportunities</strong>, a suggested priority order, and <strong>one recommended next step</strong>.
                </p>
                <Link
                  href="/consult"
                  className="inline-block bg-white text-charcoal px-8 py-3.5 text-[15px] font-medium hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Pay $99 — Book Strategy Call
                </Link>
                <p className="text-[13px] text-white/70 mt-4 leading-relaxed">
                  After payment, Roger emails or calls you to schedule
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border border-white/40 flex items-center justify-center text-white text-xs font-medium mt-0.5">1</div>
                  <div>
                    <p className="text-[15px] text-white font-medium mb-1">Live strategy session</p>
                    <p className="text-[14px] text-white/70 leading-relaxed">30–45 min, Zoom or Microsoft Teams</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border border-white/40 flex items-center justify-center text-white text-xs font-medium mt-0.5">2</div>
                  <div>
                    <p className="text-[15px] text-white font-medium mb-1">Opportunity list</p>
                    <p className="text-[14px] text-white/70 leading-relaxed">3–5 concrete ideas tied to your business</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border border-white/40 flex items-center justify-center text-white text-xs font-medium mt-0.5">3</div>
                  <div>
                    <p className="text-[15px] text-white font-medium mb-1">Priority order</p>
                    <p className="text-[14px] text-white/70 leading-relaxed">What to do first vs later</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border border-white/40 flex items-center justify-center text-white text-xs font-medium mt-0.5">4</div>
                  <div>
                    <p className="text-[15px] text-white font-medium mb-1">Written summary email</p>
                    <p className="text-[14px] text-white/70 leading-relaxed">Within 24–48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border border-white/40 flex items-center justify-center text-white text-xs font-medium mt-0.5">5</div>
                  <div>
                    <p className="text-[15px] text-white font-medium mb-1">Clear next step</p>
                    <p className="text-[14px] text-white/70 leading-relaxed">Discovery, DIY, or "not now" — so you're not left guessing</p>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-6 mt-8">
                  <p className="text-[13px] text-white/70 leading-relaxed">
                    Prepaid standalone. <strong className="text-white/90">Not</strong> credited toward discovery or other project work. One exception: credited toward <Link href="/services/ai-teammate-launch" className="text-white/90 hover:underline">AI Teammate Launch</Link> if purchased within 30 days. No full SOW, no build, no follow-up call included.
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
              Ready for a clear next step?
            </h2>
            <p className="text-lg text-text-muted mb-10 leading-relaxed">
              Book the $99 Technology Strategy Call. Pay first, Roger schedules with you, and you get a written summary within 24–48 hours of the call.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <Link
                href="/consult"
                className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Book the $99 Strategy Call
              </Link>
              <p className="text-sm text-text-muted">
                Prefer email? <a href="mailto:cerpamedia@gmail.com" className="hover:text-text underline">cerpamedia@gmail.com</a> · <a href="tel:+19432487410" className="hover:text-text underline">(943) 248-7410</a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
