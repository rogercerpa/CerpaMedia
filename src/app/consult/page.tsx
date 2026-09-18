import Link from "next/link";

const paymentLink =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL ||
  process.env.STRIPE_PAYMENT_LINK_URL;

export default function ConsultPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#84CC16] to-[#65a30d] text-[#111827] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">Limited Availability</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Technology Strategy Call
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-4">
              $99 · 30–45 minutes
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Get expert technology guidance tailored to your business needs. One focused session to identify opportunities and next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111827] text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
                >
                  Pay $99 to Get Started
                </a>
              ) : (
                <div className="bg-white rounded-lg p-6 text-left">
                  <p className="text-[#111827] font-semibold mb-2">Payment link coming soon</p>
                  <p className="text-sm text-gray-700 mb-3">
                    Contact us to inquire about the Technology Strategy Call
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:cerpamedia@gmail.com"
                      className="text-[#84CC16] hover:underline font-medium"
                    >
                      cerpamedia@gmail.com
                    </a>
                    <a
                      href="tel:+19432487410"
                      className="text-[#84CC16] hover:underline font-medium"
                    >
                      (943) 248-7410
                    </a>
                  </div>
                </div>
              )}
              <Link
                href="/contact"
                className="bg-white text-[#111827] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg border-2 border-[#111827]"
              >
                Have Questions?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Included
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-[#84CC16]/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">30–45 Minute Video Call</h3>
              <p className="text-gray-600">
                Live session via Zoom or Microsoft Teams, scheduled at your convenience
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-[#84CC16]/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Written Summary</h3>
              <p className="text-gray-600">
                Email summary within 24–48 hours highlighting 3–5 opportunities and recommended next steps
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-[#84CC16]/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Expert Guidance</h3>
              <p className="text-gray-600">
                Direct access to Roger Cerpa's experience in technology integration for small businesses
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-[#84CC16]/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Prepaid & Standalone</h3>
              <p className="text-gray-600">
                Pay $99 upfront before scheduling. This is a standalone service, not credited toward discovery or project work
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What's Not Included
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Full statement of work (SOW) or detailed project proposal</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Implementation or hands-on work</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Credit toward discovery or future projects</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Follow-up calls (available separately if needed)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#84CC16] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Pay $99</h3>
                <p className="text-gray-600">
                  Complete payment through our secure Stripe checkout. Your session is prepaid before scheduling.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#84CC16] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">We Schedule Your Call</h3>
                <p className="text-gray-600">
                  After payment, Roger will contact you directly to find a convenient time for your Zoom or Microsoft Teams session.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#84CC16] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">30–45 Minute Strategy Session</h3>
                <p className="text-gray-600">
                  Join the call to discuss your technology challenges, opportunities, and goals. Come prepared with questions and context about your business.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#84CC16] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Receive Your Summary</h3>
                <p className="text-gray-600">
                  Within 24–48 hours, you'll receive a short email summary highlighting 3–5 key opportunities and recommended next steps for your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#84CC16] to-[#65a30d] rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-[#111827]/90 mb-8 max-w-2xl mx-auto">
              Take the first step toward better technology decisions for your business. Book your Technology Strategy Call today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {paymentLink ? (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111827] text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
                >
                  Pay $99 Now
                </a>
              ) : (
                <div className="bg-white rounded-lg p-6 text-left">
                  <p className="text-[#111827] font-semibold mb-2">Payment link coming soon</p>
                  <p className="text-sm text-gray-700 mb-3">
                    Contact us to inquire
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:cerpamedia@gmail.com"
                      className="text-[#84CC16] hover:underline font-medium"
                    >
                      cerpamedia@gmail.com
                    </a>
                    <a
                      href="tel:+19432487410"
                      className="text-[#84CC16] hover:underline font-medium"
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

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Not sure if this is right for you? Reach out and we'll help you decide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:cerpamedia@gmail.com"
              className="text-[#84CC16] hover:underline font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              cerpamedia@gmail.com
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="tel:+19432487410"
              className="text-[#84CC16] hover:underline font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (943) 248-7410
            </a>
            <span className="text-gray-400">•</span>
            <Link
              href="/contact"
              className="text-[#84CC16] hover:underline font-medium"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
