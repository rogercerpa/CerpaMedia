import Link from "next/link";
import { Reveal } from "@/components/Reveal";

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
          <Reveal>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Technology that removes friction from how you operate
              </h1>
              <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
                Custom web apps, practical AI, and automation for small businesses — with paid discovery first, fixed scope when you build, and ownership that stays yours.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="border-2 border-cta p-8 md:p-10 mb-8 bg-bg">
              <div className="mb-6">
                <div className="inline-block border border-border px-3 py-1 mb-4">
                  <span className="text-[11px] font-medium text-text uppercase tracking-wider">First 5 clients · Founding rate</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4 tracking-tight">
                  Two AI teammates set up and saving you hours every week
                </h2>
                <p className="text-xl font-medium text-text mb-3">
                  $799 founding price for the first 5 clients · Regular $1,199
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed mb-4">
                  We pick the right platform (Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork), launch 2 teammates from a starter menu, set approval rules, and guarantee free fixes for 60 days from the launch session until it saves at least 3 hours a week.
                </p>
                <p className="text-[13px] text-text-muted leading-relaxed mb-6">
                  You own the tool accounts and pay vendors directly. We set up the teammates, and if your first teammate isn't saving at least 3 hours a week by day 14, we keep fixing it free (60-day window). No refunds.
                </p>
                <Link
                  href="/services/ai-teammate-launch"
                  className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  See how it works
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="bg-charcoal p-8 md:p-10 mb-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                    Stuck without a plan?
                  </h2>
                  <p className="text-[15px] text-white/90 leading-relaxed mb-3">
                    Pay $99 for a 30–45 min call with Roger. Get 3–5 opportunities and a written summary within 24–48 hours.
                  </p>
                  <p className="text-[13px] text-white/70 leading-relaxed">
                    Prepaid standalone — not credited toward discovery or other work. Exception: credited toward <Link href="/services/ai-teammate-launch" className="hover:underline text-white/90">AI Teammate Launch</Link> if purchased within 30 days.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/consult"
                    className="inline-block bg-white text-charcoal px-8 py-3 text-[15px] font-medium hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Pay $99 — Book Call
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal stagger staggerDelay={100}>
            <div className="space-y-12">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="border border-border p-8 hover:border-text-muted transition-all duration-300"
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
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-16 border border-border p-10 text-center hover:border-text-muted transition-all duration-300">
              <h3 className="text-3xl font-semibold text-text mb-4 tracking-tight">
                Need Something Else?
              </h3>
              <p className="text-[15px] text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
                We offer additional technology services beyond those listed above. If you have a specific need, let's discuss how we can help.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
