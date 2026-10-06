import { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - CerpaMedia",
  description: "CerpaMedia Terms of Service - Your agreement for using our Site and booking the Technology Strategy Call.",
};

export default function TermsPage() {
  return (
    <div>
      <section className="bg-bg py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Terms of Service
              </h1>
              <p className="text-lg text-text-muted">
                Effective: October 6, 2026 · Last updated: October 6, 2026
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
                  These Terms of Service ("Terms") are an agreement between you and CerpaMedia LLC, doing business as CerpaMedia ("CerpaMedia," "we," "us"). They cover your use of cerpamedia.com (the "Site") and your purchase of the Technology Strategy Call. By using the Site or booking a call, you agree to these Terms. If you don't agree, please don't use the Site or book a call.
                </p>
                <p className="text-text-muted leading-relaxed mt-4">
                  If you're agreeing on behalf of a company, you confirm that you're authorized to bind that company, and "you" includes the company.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">1. Using the Site</h2>
                <ul className="space-y-2 text-text-muted">
                  <li>You must be at least 18 years old to book or buy anything from us.</li>
                  <li>Use the Site only for lawful purposes, and give us accurate information.</li>
                  <li>We may change, pause, or discontinue any part of the Site at any time.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">2. The $99 Technology Strategy Call</h2>
                
                <h3 className="text-xl font-medium text-text mt-6 mb-3">What it is</h3>
                <p className="text-text-muted leading-relaxed">
                  A prepaid, one-on-one video call (30–45 minutes, on Zoom or Microsoft Teams) about your business challenges and where AI, automation, or practical technology might save you time or money.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">What you get</h3>
                <ul className="space-y-2 text-text-muted">
                  <li>The live conversation, with questions, suggestions, and discussion.</li>
                  <li>A short written summary emailed within <strong className="text-text">24–48 hours</strong> (business days) after the call, with 3–5 opportunity ideas, a suggested priority order, and one recommended next step.</li>
                </ul>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">What's NOT included</h3>
                <p className="text-text-muted leading-relaxed mb-2">The Strategy Call does not include:</p>
                <ul className="space-y-2 text-text-muted">
                  <li>A full Statement of Work, formal proposal, detailed estimate, or project plan;</li>
                  <li>Any implementation, coding, configuration, setup, or build work;</li>
                  <li>Access to, review of, or changes to your systems, accounts, or code;</li>
                  <li>Ongoing support or follow-up calls;</li>
                  <li>Legal, tax, accounting, financial, cybersecurity-audit, or regulatory-compliance advice.</li>
                </ul>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Price and payment</h3>
                <p className="text-text-muted leading-relaxed">
                  $99 USD, paid in full in advance through Stripe. Applicable taxes, if any, are additional.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Standalone product</h3>
                <p className="text-text-muted leading-relaxed">
                  The $99 fee is <strong className="text-text">not credited or applied</strong> toward discovery, a Statement of Work, or any other project.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Scheduling, cancellations, refunds, and no-shows</h3>
                <p className="text-text-muted leading-relaxed">
                  are covered by our <Link href="/strategy-call-policy" className="text-text hover:underline font-medium">Technology Strategy Call Refund, Cancellation & Reschedule Policy</Link>, which is part of these Terms.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Communication</h3>
                <p className="text-text-muted leading-relaxed">
                  We contact customers about scheduling <strong className="text-text">by email or phone call</strong>. Phone number on the booking form is <strong className="text-text">optional</strong>. We do not send text messages.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">3. Project work (discovery and builds)</h2>
                <p className="text-text-muted leading-relaxed">
                  Any work beyond the Strategy Call, such as paid discovery, custom development, automation, or integrations, requires a <strong className="text-text">separate written agreement</strong> (a Statement of Work, a Master Services Agreement, or both) that sets out the scope, price, timeline, and ownership terms. Any rate or estimate we mention, including our standard $125/hour quoting rate, is only an estimate until it appears in a signed SOW. If that signed agreement conflicts with these Terms, the signed agreement controls for that project.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">4. No guarantee of business results</h2>
                <p className="text-text-muted leading-relaxed">
                  We share our honest professional opinion based on what you tell us. <strong className="text-text">We do not guarantee any particular outcome</strong>, including revenue, cost savings, time savings, rankings, leads, or ROI. Results depend on many things we don't control, such as your implementation, your team, your vendors, and the market. You decide what to do with our suggestions, and that decision is yours.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">5. Intellectual property</h2>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Site content</h3>
                <p className="text-text-muted leading-relaxed">
                  The Site, including its text, design, graphics, logos, the "CerpaMedia" name, and Insights articles, belongs to CerpaMedia or its licensors and is protected by law. You may view the Site and share links to it. You may not copy, republish, or sell its content without our written permission, except for brief quotes with attribution.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Strategy Call materials</h3>
                <p className="text-text-muted leading-relaxed">
                  You may use your written summary freely inside your business. We keep the right to reuse our general ideas, methods, and know-how. We will not share your confidential business details (see Section 6).
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Client work product (hybrid ownership)</h3>
                <p className="text-text-muted leading-relaxed mb-2">For paid project work under a signed SOW:</p>
                <ul className="space-y-2 text-text-muted">
                  <li><strong className="text-text">You own</strong> your accounts (domains, hosting, SaaS, cloud, and similar) and the custom code and deliverables created specifically for you, <strong className="text-text">once you have paid in full</strong> for that work.</li>
                  <li><strong className="text-text">We keep</strong> our pre-existing tools, templates, libraries, frameworks, and general know-how ("CerpaMedia Materials"). If any CerpaMedia Materials are built into your deliverables, you receive a <strong className="text-text">perpetual, non-exclusive, royalty-free license</strong> to use them as part of those deliverables.</li>
                  <li><strong className="text-text">Third-party and open-source components</strong> stay under their own licenses.</li>
                  <li>The signed SOW or MSA sets the final ownership terms for each project.</li>
                </ul>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Feedback</h3>
                <p className="text-text-muted leading-relaxed">
                  If you send us suggestions about our services, we may use them without any obligation to you.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">6. Confidentiality</h2>
                <p className="text-text-muted leading-relaxed">
                  We treat the non-public business information you share during a Strategy Call as confidential. We use it only to serve you, and we disclose it only to our service providers as needed or when the law requires. Please don't share passwords, payment card numbers, health information, or other highly sensitive data on the call or in the booking form. If a project needs stronger confidentiality protections, we'll put them in a written agreement.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">7. Acceptable use</h2>
                <p className="text-text-muted leading-relaxed mb-2">You agree not to:</p>
                <ul className="space-y-2 text-text-muted">
                  <li>Use the Site for anything illegal, fraudulent, or harmful;</li>
                  <li>Submit false information, spam, or another person's details without their permission;</li>
                  <li>Try to hack, overload, scrape, or interfere with the Site, or get around its security;</li>
                  <li>Upload malware or harmful code;</li>
                  <li>Harass us or anyone else, or misuse our contact channels;</li>
                  <li>Use our content to build a competing product, or present it as your own.</li>
                </ul>

                <p className="text-text-muted leading-relaxed mt-4">
                  We may refuse service, cancel a booking (with a refund under our Policy), or block access if someone violates these rules.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">8. Third-party services</h2>
                <p className="text-text-muted leading-relaxed">
                  The Site and our calls rely on third parties such as Stripe, Zoom, Microsoft Teams, Vercel, Neon, Resend, and Google. Their own terms apply to your use of their services. We aren't responsible for their outages or actions.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">9. Disclaimer of warranties</h2>
                <p className="text-text-muted leading-relaxed">
                  Except where the law doesn't allow it, the Site, the Strategy Call, and all content are provided <strong className="text-text">"AS IS" and "AS AVAILABLE," without warranties of any kind</strong>, express or implied. That includes implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We don't promise that the Site will always be available, error-free, or secure. Insights articles are general information, may summarize third-party news, and can become out of date. They are not professional advice.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">10. Limitation of liability</h2>
                <p className="text-text-muted leading-relaxed mb-2">To the fullest extent the law allows:</p>
                <ul className="space-y-2 text-text-muted">
                  <li>CerpaMedia will <strong className="text-text">not</strong> be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, data, or business opportunities, even if we were warned they could happen.</li>
                  <li>Our <strong className="text-text">total liability</strong> for any claim related to the Site or the Strategy Call is limited to <strong className="text-text">the amount you paid us for the Strategy Call in question ($99)</strong>, or $100 if you haven't paid us anything.</li>
                </ul>

                <p className="text-text-muted leading-relaxed mt-4">
                  Some states don't allow certain limits, so some of the above may not apply to you. Separate liability terms for project work will appear in the applicable SOW or MSA.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">11. Indemnification</h2>
                <p className="text-text-muted leading-relaxed">
                  If you misuse the Site, break these Terms, or violate someone else's rights or the law, and that leads to a third-party claim against CerpaMedia, you agree to cover our reasonable losses and costs from that claim, including reasonable attorneys' fees. We'll let you know about the claim and cooperate reasonably.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">12. Governing law and disputes</h2>
                <p className="text-text-muted leading-relaxed">
                  These Terms are governed by the laws of the <strong className="text-text">State of Georgia</strong>, without regard to its conflict-of-law rules. Before filing any claim, please email us at <a href="mailto:cerpamedia@gmail.com" className="text-text hover:underline font-medium">cerpamedia@gmail.com</a> so we can try to resolve it informally within 30 days. If we can't resolve it, any lawsuit must be filed in the state or federal courts located in <strong className="text-text">Cherokee County, Georgia</strong>, and both parties consent to those courts' jurisdiction. Either party may bring a qualifying claim in small claims court.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">13. Changes to these Terms</h2>
                <p className="text-text-muted leading-relaxed">
                  We may update these Terms. The updated version will be posted here with a new "Last updated" date. Changes don't apply to calls already paid for. Those calls follow the Terms in effect when you paid, unless you agree otherwise. If you keep using the Site after an update, you accept the updated Terms.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">14. General</h2>
                <p className="text-text-muted leading-relaxed">
                  These Terms, together with the <Link href="/privacy" className="text-text hover:underline font-medium">Privacy Policy</Link>, the <Link href="/strategy-call-policy" className="text-text hover:underline font-medium">Strategy Call Policy</Link>, and any signed SOW or MSA, are the entire agreement between us on this subject. If any part is found unenforceable, the rest still applies. If we don't enforce a term right away, we haven't waived it. You may not transfer these Terms without our consent. We may transfer them as part of a sale or reorganization of the business. Neither party is responsible for delays caused by events beyond its reasonable control.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">15. Contact</h2>
                <div className="text-text-muted leading-relaxed space-y-1">
                  <p className="font-medium text-text">CerpaMedia LLC (CerpaMedia)</p>
                  <p>518 Ridge View Xing, Woodstock, GA 30188</p>
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
