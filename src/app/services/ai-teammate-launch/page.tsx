import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Teammate Launch - CerpaMedia",
  description: "Your first two AI employees working in 14 days. $799 founding rate for the first 5 clients. We set up Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork — you own the accounts.",
  alternates: {
    canonical: "https://cerpamedia.com/services/ai-teammate-launch",
  },
  openGraph: {
    title: "AI Teammate Launch - CerpaMedia",
    description: "Your first two AI employees working in 14 days. $799 founding rate for the first 5 clients. We set up Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork — you own the accounts.",
    url: "https://cerpamedia.com/services/ai-teammate-launch",
    type: "website",
  },
};

export default function AITeammateLaunchPage() {
  // TODO: Replace mailto with Stripe Payment Link when ready
  const checkoutEmail = "cerpamedia@gmail.com";
  const checkoutSubject = "AI Teammate Launch";
  
  return (
    <div>
      <section className="bg-bg py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <div className="inline-block border border-border px-3 py-1 mb-6">
                <span className="text-[11px] font-medium text-text uppercase tracking-wider">First 5 clients · $799 founding rate</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Your first two AI employees working in 14 days
              </h1>
              <p className="text-2xl md:text-3xl font-medium mb-4 text-text">
                $799 founding rate · Regular $1,199
              </p>
              <p className="text-lg text-text-muted mb-6 max-w-2xl mx-auto leading-relaxed">
                For small business owners (usually solo or teams of 1–4) ready to hand real work to AI — without DIY guesswork or wasted tool subscriptions.
              </p>
              <p className="text-[15px] text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                You own the tool accounts and pay vendors directly. We pick the right platform, launch 2 teammates from a starter menu, set approval rules, and guarantee free fixes if your first teammate isn't saving at least 3 hours a week (60-day window).
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`mailto:${checkoutEmail}?subject=${encodeURIComponent(checkoutSubject)}`}
                  className="inline-block text-text-muted px-8 py-3.5 text-[15px] font-medium hover:text-text transition-colors"
                >
                  Or reserve by email
                </a>
              </div>
              <p className="text-[13px] text-text-muted mt-6">
                The $99 is credited toward this if purchased within 30 days. After you reach out, Roger contacts you by email or call to schedule.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-16 md:py-20 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                This is for you if...
              </h2>
            </div>
          </Reveal>
          <Reveal stagger staggerDelay={60}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">You're drowning in admin work</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Inbox triage, quote drafts, invoice reminders, review replies — tasks that eat hours but don't grow revenue
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">You've tried AI tools and got stuck</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  ChatGPT tabs open, prompts saved somewhere, but nothing running consistently without you
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-medium text-text mb-2">You want leverage, not another expense</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Tools that save real hours this month — not a science project or a "maybe later" subscription
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
                Starter job menu
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                Pick 2 to launch on day one. More teammates or custom work quoted separately.
              </p>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Inbox triage</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Flags urgent messages, drafts replies for approval, archives noise
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Morning brief</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Daily summary of calendar, open tasks, and key notifications — no tab-switching
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Quote drafts</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Pulls scope, builds pricing, writes client-ready proposals from your template
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Review replies & Google Business Profile posts</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Drafts replies to customer reviews in your voice for your OK, keeps your profile active
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Social drafts</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Writes posts from your content calendar, waits for your approval before publishing
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Invoice reminders</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Tracks overdue payments, drafts friendly follow-ups for your OK, flags the ones that need a call
                </p>
              </div>

              <div className="border border-border p-6 hover:border-text-muted transition-all duration-300">
                <h3 className="text-lg font-medium mb-2 text-text">Lead intake</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Qualifies inquiries, drafts follow-up questions for your OK, routes hot leads to your CRM
                </p>
              </div>

              <div className="border border-border p-6 bg-bg-subtle">
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">Custom jobs available after launch.</strong> New teammates or specialized connectors quoted separately.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-24 md:py-32 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                How it works
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
                  <h3 className="text-lg font-medium mb-2 text-text">15-minute intake form</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Tell us which jobs you want automated, what tools you already use, and what approvals you need. Takes 15 minutes. The form is sent after full payment is received.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Setup session (in-person or virtual)</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed mb-2">
                    <strong className="text-text">Option A:</strong> One 2-hour in-person visit (if you're within 60 minutes of Woodstock, GA by Google Maps at booking)
                  </p>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    <strong className="text-text">Option B:</strong> Two 1-hour virtual sessions (Zoom or Microsoft Teams)
                  </p>
                  <p className="text-[15px] text-text-muted leading-relaxed mt-2">
                    We pick the right tool (Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork), set up your 2 teammates, configure approval rules, and test live. Extra in-person visits after launch are billed at $125/hr including drive time.
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
                  <h3 className="text-lg font-medium mb-2 text-text">Day-14 check-in with scorecard</h3>
                  <p className="text-[15px] text-text-muted leading-relaxed">
                    Two weeks after the launch session, we review the scorecard: hours saved (measured as tasks completed × minutes saved per task), tasks completed, friction points. If you're not saving at least 3 hours a week, we keep fixing for free. The 60-day guarantee window starts at the launch session. Each fix is completed within 5 business days.
                  </p>
                </div>
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
                What you get
              </h2>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={70}>
            <div className="space-y-6 mb-16">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">The right tool picked for you</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  We evaluate Grok Bot, OpenAI Dots, Meta Muse, and Claude Cowork against your workflow, then set up the winner. You're not guessing.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">2 AI teammates running real jobs</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Pick from the starter menu — inbox triage, morning brief, quote drafts, review replies, social drafts, invoice reminders, or lead intake. Configured, tested, and live by the end of setup.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">Approval rules so nothing breaks</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Nothing sends, spends, or deletes without your OK. Teammates draft, flag, and queue — you review and approve.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">One-page owner's guide</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  How to pause a teammate, change a job, or hand off access. Plain English, no jargon.
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">Day-14 scorecard</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Hours saved, tasks completed, what's working, what needs tuning. You'll know if it's paying off.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg-subtle">
                <h3 className="text-lg font-medium mb-3 text-text">You own the accounts</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Tool accounts stay in your name. You pay the platform vendor directly. CerpaMedia is added as a collaborator — we're not a middleman or landlord.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-20 md:py-24 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="border-2 border-text p-8 md:p-12 bg-bg">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4 tracking-tight">
                  The guarantee
                </h2>
                <p className="text-xl font-medium text-text mb-4">
                  Free fixes until your first teammate saves at least 3 hours a week
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[15px] text-text-muted leading-relaxed">
                  If you're not saving at least 3 hours per week with your first teammate by day 14, we keep tuning and fixing remotely until you hit that bar — no additional charge. Hours saved are measured as tasks completed × minutes saved per task, shown on your day-14 scorecard.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">What's covered:</strong> adjustments to your 2 launched teammates, remote troubleshooting, and re-training the AI on your processes. Each fix is completed within 5 business days.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">Time window:</strong> 60 days from the launch session. After that, ongoing support moves to the optional Teammate Care plan.
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">You must:</strong> keep your tool account paid and active, and use the teammate at least once per business day during the 60-day window.
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-[13px] text-text-muted leading-relaxed">
                  <strong className="text-text">No refunds.</strong> The $799 founding rate is for setup, configuration, and the 60-day guarantee period. If you decide AI isn't for your business, you keep the accounts and the setup — but the fee isn't refundable.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                Optional add-on: Teammate Care
              </h2>
              <p className="text-2xl font-medium text-text mb-2">
                $149/month · Month to month
              </p>
              <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                Available after your day-14 check-in — keeps your teammates sharp as tools and workflows evolve
              </p>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={70}>
            <div className="space-y-6">
              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">30-minute monthly tune-up</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Zoom or Teams session to review performance, adjust jobs, and catch issues before they compound
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">1 new job per quarter</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Add a job from the starter menu every 3 months — no extra charge
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">Updates when the tools change</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  When Grok, Dots, Muse, or Claude Cowork ships a breaking update, we handle the migration — we update your setup so your teammates keep working
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">Email support (1 business day reply)</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Stuck or see odd behavior? Email anytime, get a response within 1 business day
                </p>
              </div>

              <div className="border border-border p-8 hover:border-text-muted transition-all duration-300">
                <h3 className="text-xl font-medium mb-2 text-text">Monthly hours-saved report</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Simple scorecard showing tasks completed and estimated time reclaimed — so you know it's still worth it
                </p>
              </div>

              <div className="border border-border p-6 bg-bg-subtle">
                <p className="text-[15px] text-text-muted leading-relaxed">
                  <strong className="text-text">Month to month.</strong> Cancellation takes effect at the end of your paid month. An unused quarterly job doesn't carry over. New teammates beyond the starter menu, or custom connectors (CRM, accounting, ops tools) are quoted separately.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-subtle py-20 md:py-24 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                Questions owners ask
              </h2>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={60}>
            <div className="space-y-6">
              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">Who owns the tool accounts?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  You do. Accounts are created in your name (or your business name). You pay the platform vendor directly — xAI (Grok), OpenAI, Meta, or Anthropic. CerpaMedia is added as a collaborator to configure and maintain your teammates. If you ever stop working with us, you keep full access.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">What do the AI tools cost me?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  You pay the platform vendor directly for your subscription. Most require a paid plan — for example, Claude Cowork is included with paid Claude plans (Pro, Max, Team, or Enterprise), not the free plan. During our intake and setup, we'll help you pick the right tier for your workload so you're not overpaying.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">What if my plan doesn't have a collaborator seat?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  If your plan is single-seat with no collaborator access, we set it up on your device while you're signed in. We never ask for your passwords. After setup, you have full control and can use your teammates from any device where you're logged in.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">When do I pay?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Full payment ($799 founding rate) is due before the intake form is sent. Once payment clears, Roger contacts you to schedule, and you receive the intake form link.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">What if it doesn't save me 3 hours a week?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  We keep fixing remotely — no extra charge — until your first teammate hits that bar. The 60-day guarantee window starts at the launch session. After 60 days, ongoing support moves to the optional Teammate Care plan ($149/month). No refunds, but you keep the setup and accounts.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">In-person or virtual — which is better?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  In-person (one 2-hour session) works well if you're within 60 minutes of Woodstock, GA by Google Maps at booking and want to knock it out in one sitting. Virtual (two 1-hour sessions) gives you breathing room to test between calls. Both get you to the same finish line.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">How do you pick which tool to use?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  During the intake form and setup session, we ask what tools you already use, what approvals you need, and what jobs you want automated. Then we evaluate Grok Bot, OpenAI Dots, Meta Muse, and Claude Cowork for integration ease, cost, and fit. You're not locked into one platform just because it's trendy.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">Can I add more teammates later?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  Yes. With the Teammate Care plan ($149/month), you get 1 new job per quarter from the starter menu at no extra charge. Custom teammates or specialized connectors (CRM, accounting, ops tools) are quoted separately as custom work.
                </p>
              </div>

              <div className="border border-border p-8 bg-bg">
                <h3 className="text-lg font-medium mb-3 text-text">What's the founding rate, and how long does it last?</h3>
                <p className="text-[15px] text-text-muted leading-relaxed">
                  $799 for the first 5 clients (regular price $1,199 afterward). We're limiting to 4 launch slots per month while we refine the process. Once the first 5 are launched, the price goes up.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
              Claim your $799 founding rate
            </h2>
            <p className="text-lg text-white/90 mb-4 leading-relaxed">
              First 5 clients only. 4 launch slots per month.
            </p>
            <p className="text-[15px] text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              After you reach out, Roger contacts you by email or call to schedule the intake form and setup session. You own the accounts, we set up the teammates, and if your first teammate isn't saving at least 3 hours a week, we keep fixing it free (60-day window).
            </p>
            <div className="flex flex-col gap-4 items-center">
              <Link
                href="/consult"
                className="inline-block bg-white text-charcoal px-8 py-3.5 text-[15px] font-medium hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
              >
                Book the $99 Strategy Call
              </Link>
              <p className="text-sm text-white/70">
                The $99 is credited toward this if purchased within 30 days. Questions first? <a href="mailto:cerpamedia@gmail.com" className="hover:text-white underline">cerpamedia@gmail.com</a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
