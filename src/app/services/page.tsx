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
      <section className="bg-bg py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
              Our Services
            </h1>
            <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              Comprehensive technology services designed to help small businesses operate more efficiently
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal p-8 md:p-10 mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-block border border-white/20 px-3 py-1 mb-3">
                  <span className="text-[11px] font-medium text-white uppercase tracking-wider">New offering</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight">
                  Technology Strategy Call
                </h2>
                <p className="text-lg text-white/90 mb-2">
                  $99 · 30–45 minutes · One-on-one guidance
                </p>
                <p className="text-[15px] text-white/70 leading-relaxed">
                  Expert technology advice in a focused session. Prepaid standalone consultation with written summary delivered within 24–48 hours.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/consult"
                  className="inline-block bg-white text-charcoal px-8 py-3 text-[15px] font-medium hover:bg-gray-100 transition-colors"
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
                className="border border-border p-8 hover:border-text-muted transition-colors"
              >
                <h2 className="text-3xl font-semibold text-text mb-4 tracking-tight">
                  {service.title}
                </h2>
                <p className="text-[15px] text-text-muted mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium text-text mb-3 text-sm uppercase tracking-wider">What we offer</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <span className="text-text-muted text-[15px]">•</span>
                        <span className="text-text-muted text-[15px] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-border p-10 text-center">
            <h3 className="text-3xl font-semibold text-text mb-4 tracking-tight">
              Need Something Else?
            </h3>
            <p className="text-[15px] text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              We offer additional technology services beyond those listed above. If you have a specific need, let's discuss how we can help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
