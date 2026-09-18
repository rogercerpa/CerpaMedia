import Link from "next/link";

export default function ConsultPage() {
  const stripePaymentLink =
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL ||
    process.env.STRIPE_PAYMENT_LINK_URL;
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
              60-Minute Consultation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Technology Strategy Call
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Get expert guidance on your technology needs, challenges, and
              opportunities in a focused one-on-one consultation.
            </p>
            <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-8">
              <span className="text-white/60 line-through">$149</span>
              <span>$99</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What You'll Get
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <strong className="text-gray-900">
                    One-on-one consultation
                  </strong>{" "}
                  <span className="text-gray-600">
                    with a senior technology consultant focused entirely on your
                    business needs
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <strong className="text-gray-900">Expert guidance</strong>{" "}
                  <span className="text-gray-600">
                    on technology strategy, AI integration opportunities, and
                    automation potential
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <strong className="text-gray-900">Actionable insights</strong>{" "}
                  <span className="text-gray-600">
                    and specific recommendations you can implement immediately
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <strong className="text-gray-900">Follow-up summary</strong>{" "}
                  <span className="text-gray-600">
                    documenting key discussion points and next steps
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Planning a technology project
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get guidance before investing in new systems or applications
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Exploring AI opportunities
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Understand where AI makes sense for your business
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Identifying automation potential
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Discover opportunities to streamline operations
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Technology questions
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get answers about tools, platforms, or technical decisions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready to Schedule Your Consultation?
            </h3>
            {stripePaymentLink ? (
              <>
                <p className="text-gray-600 mb-6">
                  Pay now to secure your session. You'll receive an email to schedule your preferred time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={stripePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Pay $99 Now
                  </a>
                  <a
                    href="tel:+19432487410"
                    className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-primary-600"
                  >
                    Call (943) 248-7410
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Contact us to schedule your session.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Contact Us to Book
                  </Link>
                  <a
                    href="tel:+19432487410"
                    className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-primary-600"
                  >
                    Call (943) 248-7410
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
