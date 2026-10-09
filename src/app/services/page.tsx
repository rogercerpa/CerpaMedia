import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getPublishedServices, getServiceBySlug, fallbackServices, fallbackFeaturedService } from "@/lib/services";

export default async function ServicesPage() {
  // Fetch services from DB with fallback
  const dbServices = await getPublishedServices();
  const featuredService = await getServiceBySlug("ai-teammate-launch");
  
  // Use DB services if available, otherwise fallback to hardcoded
  const services = dbServices.length > 0 
    ? dbServices.filter(s => !s.featured && s.slug !== "technology-strategy-call")
    : fallbackServices;
  
  const featured = featuredService || fallbackFeaturedService;

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
                {featured.badgeText && (
                  <div className="inline-block border border-border px-3 py-1 mb-4">
                    <span className="text-[11px] font-medium text-text uppercase tracking-wider">{featured.badgeText}</span>
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4 tracking-tight">
                  {featured.title}
                </h2>
                <p className="text-xl font-medium text-text mb-3">
                  {featured.priceLabel}
                </p>
                <p className="text-[15px] text-text-muted leading-relaxed mb-4">
                  {featured.description}
                </p>
                <p className="text-[13px] text-text-muted leading-relaxed mb-6">
                  You own the tool accounts and pay vendors directly. If your first teammate isn't saving at least 3 hours a week, we keep fixing it free (60-day window from the launch session). No refunds.
                </p>
                <Link
                  href={featured.ctaUrl}
                  className="inline-block bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  {featured.ctaLabel}
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
              {services.map((service) => (
                <div
                  key={service.slug}
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
