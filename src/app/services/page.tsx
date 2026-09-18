import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      title: "Web Development",
      description: "Custom websites and web applications tailored to your business requirements. We build responsive, fast, and user-friendly solutions that work across all devices.",
      features: [
        "Custom website design and development",
        "Responsive design for mobile and desktop",
        "Content management systems",
        "E-commerce solutions",
        "Performance optimization"
      ]
    },
    {
      title: "Web Applications",
      description: "Complex web applications that power your business operations. From customer portals to internal management systems, we build scalable solutions.",
      features: [
        "Custom business applications",
        "Database design and integration",
        "API development and integration",
        "User authentication and security",
        "Cloud hosting and deployment"
      ]
    },
    {
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions your customers can access anywhere.",
      features: [
        "iOS and Android app development",
        "Cross-platform solutions",
        "Mobile-first design approach",
        "App store submission and updates",
        "Push notifications and offline functionality"
      ]
    },
    {
      title: "AI System Integration",
      description: "Practical integration of AI capabilities into your existing systems. We help you understand where AI makes sense and implement solutions that deliver real value.",
      features: [
        "AI feasibility assessment",
        "Integration with existing systems",
        "Natural language processing",
        "Machine learning model implementation",
        "AI-powered automation"
      ]
    },
    {
      title: "AI Consulting",
      description: "Strategic guidance on adopting AI technologies. We help you separate hype from practical applications and make informed decisions about AI investments.",
      features: [
        "AI strategy and roadmap development",
        "Use case identification and validation",
        "Vendor and solution evaluation",
        "Risk assessment and mitigation",
        "Training and knowledge transfer"
      ]
    },
    {
      title: "Automation Consulting",
      description: "Identify and implement automation opportunities across your business processes. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
      features: [
        "Process analysis and mapping",
        "Automation opportunity identification",
        "Tool selection and implementation",
        "Workflow optimization",
        "Monitoring and continuous improvement"
      ]
    },
    {
      title: "Business Process Improvement & Automation",
      description: "Comprehensive review and optimization of your business processes. We combine process improvement methodologies with automation technologies to drive efficiency.",
      features: [
        "Current state assessment",
        "Process redesign and optimization",
        "Automation implementation",
        "Change management support",
        "Metrics and performance tracking"
      ]
    }
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive technology services designed to help small businesses operate more efficiently
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#84CC16] to-[#65a30d] rounded-lg shadow-lg hover:shadow-xl transition-shadow p-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                  <span className="text-xs font-semibold text-[#111827]">NEW OFFERING</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-3">
                  Technology Strategy Call
                </h2>
                <p className="text-lg text-[#111827]/90 mb-2">
                  $99 · 30–45 minutes · One-on-one guidance
                </p>
                <p className="text-[#111827]/80">
                  Get expert technology advice in a focused session. Prepaid standalone consultation with written summary delivered within 24–48 hours.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/consult"
                  className="inline-block bg-[#111827] text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {service.description}
                </p>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What we offer:</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Something Else?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              We offer additional technology services beyond those listed above. If you have a specific need, let's discuss how we can help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
