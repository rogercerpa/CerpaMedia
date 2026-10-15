import { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getSeoMeta } from "@/lib/seo";
import { isFoundationsUiEnabled } from "@/lib/flags";
import DraftPrivacySections from "@/components/DraftPrivacySections";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("/privacy");
  
  return {
    title: seo.title || "Privacy Policy - CerpaMedia",
    description: seo.description || "CerpaMedia Privacy Policy - How we collect, use, and protect your personal information.",
    ...(seo.ogImageUrl && { openGraph: { images: [seo.ogImageUrl] } }),
  };
}

export default async function PrivacyPage() {
  let showDraft = false;
  try {
    showDraft = await isFoundationsUiEnabled();
  } catch {
    showDraft = false;
  }

  return (
    <div>
      <section className="bg-bg py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Privacy Policy
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
                  CerpaMedia ("CerpaMedia," "we," "us") is a trade name of CerpaMedia LLC, a Georgia limited liability company, located in Woodstock, GA. This policy explains what personal information we collect through cerpamedia.com (the "Site"), why we collect it, and the choices you have.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">1. Information we collect</h2>
                
                <h3 className="text-xl font-medium text-text mt-6 mb-3">Information you give us</h3>
                <ul className="space-y-2 text-text-muted">
                  <li><strong className="text-text">Contact form:</strong> your name, email, company (optional), the service you're interested in, and your message.</li>
                  <li><strong className="text-text">Strategy Call booking:</strong> your name, email, phone number (optional), company, preferred meeting platform (Zoom or Microsoft Teams), your chosen time slot, and the notes you share about your business.</li>
                  <li><strong className="text-text">Emails and calls:</strong> whatever you choose to share when you write to us or talk with us.</li>
                </ul>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Payment information</h3>
                <p className="text-text-muted leading-relaxed">
                  Payments for the $99 Technology Strategy Call are handled by <strong className="text-text">Stripe</strong>. You enter your card details directly with Stripe, so we never receive or store your full card number. Stripe sends us limited details such as your name, email, amount paid, payment status, a transaction ID, and in some cases the card brand and last four digits.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">Information collected automatically</h3>
                <p className="text-text-muted leading-relaxed mb-2">
                  Like most websites, our hosting provider (<strong className="text-text">Vercel</strong>) automatically records basic technical data when you visit, including IP address, browser type, device information, pages requested, referring URL, and date/time. We use these logs to run, secure, and troubleshoot the Site.
                </p>
                <p className="text-text-muted leading-relaxed">
                  We do <strong className="text-text">not</strong> currently use third-party analytics, advertising pixels, or tracking cookies. See Section 7.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">2. How we use your information</h2>
                <ul className="space-y-2 text-text-muted">
                  <li>To respond to your questions and requests.</li>
                  <li>To book, schedule, deliver, and follow up on your Technology Strategy Call, including sending your written summary.</li>
                  <li>To process payments and refunds, and to keep records for accounting, tax, and dispute purposes.</li>
                  <li>To send transactional emails such as booking confirmations, receipts, scheduling messages, and summaries.</li>
                  <li>To call you about scheduling your booking, if you optionally gave us your phone number for that purpose. (Phone is optional; we email or call — we do not text.)</li>
                  <li>To prepare proposals or statements of work if you ask us to.</li>
                  <li>To protect the Site, prevent spam and fraud, and comply with the law.</li>
                </ul>

                <p className="text-text-muted leading-relaxed mt-4">
                  We do <strong className="text-text">not</strong> add you to a marketing email list just because you contacted us or booked a call. If we ever offer a newsletter, you'll have to opt in, and every marketing email will include an unsubscribe link.
                </p>

                <p className="text-text-muted leading-relaxed mt-4">
                  <strong className="text-text">We do not send text messages (SMS).</strong> If that changes, we will ask for your separate consent first.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">3. We do not sell your personal information</h2>
                <p className="text-text-muted leading-relaxed">
                  We do <strong className="text-text">not</strong> sell your personal information. We do <strong className="text-text">not</strong> share it for cross-context behavioral advertising, and we do not rent or trade contact lists.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">4. Who we share information with</h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  We share information only with service providers ("processors") that help us run the business. They may use it only to provide their services to us:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-border text-sm">
                    <thead className="bg-bg-subtle">
                      <tr>
                        <th className="border border-border px-4 py-2 text-left text-text font-medium">Provider</th>
                        <th className="border border-border px-4 py-2 text-left text-text font-medium">What they do for us</th>
                        <th className="border border-border px-4 py-2 text-left text-text font-medium">Data involved</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Stripe</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Payment processing, fraud prevention, refunds</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Payment and billing details, name, email</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Neon</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Database hosting</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Contact form and booking records</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Resend</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Sending transactional email</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Name, email, message content</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Vercel</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Website hosting and server logs</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Technical and log data; form submissions pass through it</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Zoom / Microsoft Teams</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Video calls (whichever you choose)</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Name, email, call participation</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-4 py-2 text-text">Google (Gmail / Workspace)</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Business email and calendar</td>
                        <td className="border border-border px-4 py-2 text-text-muted">Emails and scheduling details</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-text-muted leading-relaxed mt-4">
                  Each provider handles data under its own privacy terms. Some may process data outside your state or country.
                </p>

                <p className="text-text-muted leading-relaxed mt-4">
                  We may also disclose information: (a) if the law, a subpoena, or a court order requires it; (b) to protect our rights, our users, or the public; (c) to our professional advisors (such as an attorney or accountant) under confidentiality; or (d) as part of a merger, sale, or reorganization of the business, in which case this policy continues to apply to your information.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">5. How long we keep information</h2>
                <ul className="space-y-2 text-text-muted">
                  <li><strong className="text-text">Contact form messages that don't lead to a booking:</strong> up to 24 months, then deleted.</li>
                  <li><strong className="text-text">Booking and Strategy Call records, notes, and summaries:</strong> up to 3 years after the call, so we can support you, answer follow-up questions, and handle any disputes.</li>
                  <li><strong className="text-text">Payment and transaction records:</strong> as long as tax and accounting rules require (typically up to 7 years). Stripe also keeps its own records under its policies.</li>
                  <li><strong className="text-text">Server logs:</strong> according to Vercel's standard log retention, which is usually short-term.</li>
                </ul>

                <p className="text-text-muted leading-relaxed mt-4">
                  You can ask us to delete your information sooner (see Section 8). We may keep some records if the law requires it or if we need them to resolve a dispute.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">6. Security</h2>
                <p className="text-text-muted leading-relaxed">
                  We use reasonable safeguards for a small business. Data travels over encrypted HTTPS connections. We use reputable cloud providers, limit who can access the data, and protect accounts with strong passwords and multi-factor authentication where available. No website or system is 100% secure, so we can't guarantee absolute security. If a breach affects your personal information, we will notify you as required by law.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">7. Cookies and similar technologies</h2>
                <p className="text-text-muted leading-relaxed">
                  Today the Site uses only what it needs to work, such as basic technical functions of our hosting and booking flow. Stripe's checkout pages may set their own cookies for payment security and fraud prevention under Stripe's policies. <strong className="text-text">We do not currently use third-party analytics or advertising cookies.</strong> If we add them later, we will update this policy before they go live and, where required, ask for your consent first. You can block or delete cookies in your browser settings, but some features may stop working.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">8. Your privacy rights</h2>
                <p className="text-text-muted leading-relaxed mb-4">Wherever you live, you can ask us to:</p>
                <ul className="space-y-2 text-text-muted">
                  <li><strong className="text-text">Access</strong> the personal information we hold about you;</li>
                  <li><strong className="text-text">Correct</strong> information that is inaccurate;</li>
                  <li><strong className="text-text">Delete</strong> your information, subject to legal record-keeping requirements;</li>
                  <li><strong className="text-text">Stop</strong> any marketing emails (we don't currently send any).</li>
                </ul>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">California and other U.S. state privacy rights</h3>
                <p className="text-text-muted leading-relaxed">
                  Residents of California and several other states may have rights under their state privacy laws, such as the right to know what personal information is collected and how it is used and shared, to delete it, to correct it, to opt out of its sale or sharing (<strong className="text-text">we do not sell or share it</strong>), and to not be treated differently for exercising these rights. Some of these laws may not apply to a business our size. We will still respond to reasonable requests from anyone. You may use an authorized agent, and we may need to verify your identity, usually by confirming the email address you used with us, before we act on a request.
                </p>

                <h3 className="text-xl font-medium text-text mt-6 mb-3">How to make a request</h3>
                <p className="text-text-muted leading-relaxed">
                  Email <a href="mailto:cerpamedia@gmail.com" className="text-text hover:underline font-medium">cerpamedia@gmail.com</a> with the subject line "Privacy Request," or mail CerpaMedia LLC, Woodstock, GA. We aim to respond within 30 days and no later than any period the law requires.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">9. Children's privacy</h2>
                <p className="text-text-muted leading-relaxed">
                  The Site and our services are for businesses and adults. They are <strong className="text-text">not directed to children under 13</strong>, and we don't knowingly collect personal information from children under 13. If you believe a child has sent us information, contact us and we will delete it.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">10. Links to other sites</h2>
                <p className="text-text-muted leading-relaxed">
                  The Site may link to other websites, such as Stripe, Zoom, Microsoft, or articles in our Insights section. Their own privacy policies apply, not this one.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">11. Changes to this policy</h2>
                <p className="text-text-muted leading-relaxed">
                  We may update this policy from time to time. When we do, we'll post the new version here and change the "Last updated" date. If a change is significant, we'll put a notice on the Site or email active customers before it takes effect.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-text mb-4">12. Contact us</h2>
                <div className="text-text-muted leading-relaxed space-y-1">
                  <p className="font-medium text-text">CerpaMedia LLC, Woodstock, GA</p>
                  <p>
                    <a href="mailto:cerpamedia@gmail.com" className="text-text hover:underline">cerpamedia@gmail.com</a> · <a href="tel:+19432487410" className="text-text hover:underline">(943) 248-7410</a>
                  </p>
                </div>
              </div>

              {showDraft ? <DraftPrivacySections /> : null}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
