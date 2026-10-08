import { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Strategy Call Policy - CerpaMedia",
  description: "Technology Strategy Call refund, cancellation, reschedule and no-show policy.",
};

export default function StrategyCallPolicyPage() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Strategy Call Policy
              </h1>
              <p className="text-lg text-text-muted mb-4">
                Effective: October 6, 2026 · Last updated: October 6, 2026
              </p>
              <p className="text-xl text-text-muted max-w-2xl mx-auto">
                $99 Technology Strategy Call: Refund, Cancellation, Reschedule & No-Show Policy
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal stagger staggerDelay={50}>
            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <p className="text-text-muted leading-relaxed">
                  The Technology Strategy Call costs <strong className="text-text">$99, paid in advance through Stripe</strong>. It is a standalone service. The $99 fee is <strong className="text-text">not credited toward discovery or other project work</strong>, with one exception: <strong className="text-text">if you purchase <Link href="/services/ai-teammate-launch" className="text-text hover:underline">AI Teammate Launch</Link> within 30 days of your call, the $99 comes off</strong>. This policy explains how cancellations, refunds, and rescheduling work.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">At a glance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border border-border text-sm">
                    <thead className="bg-bg-subtle">
                      <tr>
                        <th className="border border-border px-4 py-2 text-left text-text font-medium">Situation</th>
                        <th className="border border-border px-4 py-2 text-left text-text font-medium">What happens</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">You cancel <strong className="text-text">24+ hours</strong> before your scheduled call</td>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">Full refund</strong> ($99)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">You paid, but a call time hasn't been confirmed yet, and you cancel</td>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">Full refund</strong></td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">You cancel <strong className="text-text">less than 24 hours</strong> before the call</td>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">No refund, no credit</strong></td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">You <strong className="text-text">don't show up</strong> (no-show)</td>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">No refund, no credit</strong></td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">You reschedule <strong className="text-text">24+ hours</strong> before the call</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Free, <strong className="text-text">one time</strong></td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">We</strong> cancel or can't make it</td>
                        <td className="border border-border px-4 py-2 text-text-muted"><strong className="text-text">Your choice:</strong> full refund or reschedule</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text-muted">Technical issue on our side that stops the call</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Your choice: reschedule or full refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">1. Cancelling</h2>
                <ul className="space-y-2 text-text-muted">
                  <li><strong className="text-text">24 hours or more before your scheduled start time:</strong> full refund of $99.</li>
                  <li><strong className="text-text">No call time confirmed yet:</strong> full refund if you cancel before a time is confirmed.</li>
                  <li><strong className="text-text">Less than 24 hours before your scheduled start time:</strong> no refund and no credit, because that time slot was reserved just for you.</li>
                  <li>The 24-hour window is measured in <strong className="text-text">Eastern Time (ET)</strong> from the scheduled start time.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">2. Rescheduling</h2>
                <ul className="space-y-2 text-text-muted">
                  <li>You may reschedule <strong className="text-text">once at no charge</strong> if you ask <strong className="text-text">at least 24 hours</strong> before your scheduled start time.</li>
                  <li>A rescheduled call should take place within <strong className="text-text">30 days</strong> of the original date. After that, we may treat the booking as cancelled without a refund, unless we're the reason for the delay.</li>
                  <li>Requests made less than 24 hours before the call count as a late cancellation. We may make an exception at our discretion, for example in a real emergency.</li>
                  <li>If you ask for a second reschedule, we'll try to accommodate you, but we don't have to.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">3. No-shows and late arrivals</h2>
                <ul className="space-y-2 text-text-muted">
                  <li>If you don't join within <strong className="text-text">15 minutes</strong> of the start time and haven't contacted us, we treat it as a <strong className="text-text">no-show</strong>: no refund, no credit.</li>
                  <li>If you join late, the call still <strong className="text-text">ends at the originally scheduled time</strong>, and the full fee still applies.</li>
                  <li>If you have trouble connecting, email or call us right away at <a href="tel:+19432487410" className="text-text hover:underline font-medium">(943) 248-7410</a>. We'll try to help, including switching between Zoom and Teams.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">4. If CerpaMedia cancels</h2>
                <p className="text-text-muted leading-relaxed">
                  If we need to cancel or miss your call for any reason, including illness, an emergency, or a technical problem on our side, you can choose a <strong className="text-text">full refund</strong> or a <strong className="text-text">new time</strong> at no cost. If we can't reach you to confirm your choice within 7 days, we'll issue the refund automatically.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">5. After the call</h2>
                <p className="text-text-muted leading-relaxed">
                  Once the call has taken place, the fee is <strong className="text-text">non-refundable</strong>. If you haven't received your written summary within 48 business hours, email us and we'll send it right away. If you think something went seriously wrong, contact us first. We review each concern in good faith.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">6. How to request a cancellation, refund, or reschedule</h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  Email <a href="mailto:cerpamedia@gmail.com" className="text-text hover:underline font-medium">cerpamedia@gmail.com</a> with the subject line <strong className="text-text">"Strategy Call: Cancel / Refund / Reschedule."</strong> Include:
                </p>
                <ul className="space-y-2 text-text-muted">
                  <li>Your name and the email address you used to book;</li>
                  <li>Your scheduled call date and time;</li>
                  <li>What you'd like: cancel/refund or reschedule (with 2–3 alternative times).</li>
                </ul>

                <p className="text-text-muted leading-relaxed mt-4">
                  The time we <strong className="text-text">receive</strong> your email determines whether you're inside the 24-hour window. We aim to reply within <strong className="text-text">1 business day</strong>. You can also call <a href="tel:+19432487410" className="text-text hover:underline font-medium">(943) 248-7410</a>. If you call, please follow up by email so we have a written record.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">7. Refund timing</h2>
                <p className="text-text-muted leading-relaxed">
                  Approved refunds go back to the <strong className="text-text">original payment method through Stripe</strong>, usually within 2 business days of approval. Your bank or card issuer typically takes 5–10 business days to post the refund to your account. We don't charge refund fees.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">8. Payment disputes</h2>
                <p className="text-text-muted leading-relaxed">
                  If you have a problem, please contact us before filing a chargeback with your bank. We can usually fix things faster. We keep booking records, communications, and call/summary records, and we may share them with Stripe if a dispute is filed.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">9. Changes</h2>
                <p className="text-text-muted leading-relaxed">
                  We may update this policy. Your booking follows the version in effect on the date you paid.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">Contact</h2>
                <div className="text-text-muted leading-relaxed space-y-1">
                  <p className="font-medium text-text">CerpaMedia LLC, Woodstock, GA</p>
                  <p>
                    <a href="mailto:cerpamedia@gmail.com" className="text-text hover:underline">cerpamedia@gmail.com</a> · <a href="tel:+19432487410" className="text-text hover:underline">(943) 248-7410</a>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
