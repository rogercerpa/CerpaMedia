import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Seed booking settings
  await prisma.bookingSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      slotLengthMin: 60,
      bufferMin: 15,
      minLeadTimeHrs: 24,
    },
  });
  console.log("✓ Created/updated booking settings");

  // Seed default availability rules (Mon-Fri, 10am-4pm ET)
  const defaultRules = [
    { weekday: 1, startTime: "10:00", endTime: "16:00" }, // Monday
    { weekday: 2, startTime: "10:00", endTime: "16:00" }, // Tuesday
    { weekday: 3, startTime: "10:00", endTime: "16:00" }, // Wednesday
    { weekday: 4, startTime: "10:00", endTime: "16:00" }, // Thursday
    { weekday: 5, startTime: "10:00", endTime: "16:00" }, // Friday
  ];

  for (const rule of defaultRules) {
    await prisma.availabilityRule.upsert({
      where: {
        id: `default-${rule.weekday}`,
      },
      update: rule,
      create: {
        id: `default-${rule.weekday}`,
        ...rule,
        timezone: "America/New_York",
      },
    });
  }
  console.log("✓ Created/updated default availability rules");

  // Services: current public content with new CMS fields
  // Using exact copy from /services page to ensure nothing changes visibly
  const services = [
    {
      slug: "web-development",
      title: "Web Development",
      shortDesc: "Custom websites and web applications tailored to your business requirements.",
      longDesc: "Custom websites and web applications tailored to your business requirements. We build responsive, fast, and user-friendly solutions that work across all devices.",
      description: "Custom websites and web applications tailored to your business requirements. We build responsive, fast, and user-friendly solutions that work across all devices.",
      features: [
        "Custom website design and development",
        "Responsive design for mobile and desktop",
        "Content management systems",
        "E-commerce solutions",
        "Performance optimization"
      ],
      outcome: "Responsive, fast websites that work across all devices",
      priceLabel: "Starting at $5,000",
      price: 5000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 1,
      published: true,
      featured: false,
      seoTitle: "Web Development Services - CerpaMedia",
      seoDescription: "Custom websites and web applications tailored to your business. Responsive, fast, and user-friendly solutions.",
    },
    {
      slug: "web-applications",
      title: "Web Applications",
      shortDesc: "Complex web applications that power your business operations.",
      longDesc: "Complex web applications that power your business operations. From customer portals to internal management systems, we build scalable solutions.",
      description: "Complex web applications that power your business operations. From customer portals to internal management systems, we build scalable solutions.",
      features: [
        "Custom business applications",
        "Database design and integration",
        "API development and integration",
        "User authentication and security",
        "Cloud hosting and deployment"
      ],
      outcome: "Scalable applications from customer portals to management systems",
      priceLabel: "Starting at $10,000",
      price: 10000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 2,
      published: true,
      featured: false,
      seoTitle: "Web Application Development - CerpaMedia",
      seoDescription: "Complex web applications that power your business operations. Scalable solutions for customer portals and internal systems.",
    },
    {
      slug: "mobile-apps",
      title: "Mobile Apps",
      shortDesc: "Native and cross-platform mobile applications for iOS and Android.",
      longDesc: "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions your customers can access anywhere.",
      description: "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions your customers can access anywhere.",
      features: [
        "iOS and Android app development",
        "Cross-platform solutions",
        "Mobile-first design approach",
        "App store submission and updates",
        "Push notifications and offline functionality"
      ],
      outcome: "Mobile solutions your customers can access anywhere",
      priceLabel: "Starting at $15,000",
      price: 15000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 3,
      published: true,
      featured: false,
      seoTitle: "Mobile App Development - CerpaMedia",
      seoDescription: "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions.",
    },
    {
      slug: "ai-system-integration",
      title: "AI System Integration",
      shortDesc: "Practical integration of AI capabilities into your existing systems.",
      longDesc: "Practical integration of AI capabilities into your existing systems. We help you understand where AI makes sense and implement solutions that deliver real value.",
      description: "Practical integration of AI capabilities into your existing systems. We help you understand where AI makes sense and implement solutions that deliver real value.",
      features: [
        "AI feasibility assessment",
        "Integration with existing systems",
        "Natural language processing",
        "Machine learning model implementation",
        "AI-powered automation"
      ],
      outcome: "AI solutions that deliver real value in your workflow",
      priceLabel: "Starting at $8,000",
      price: 8000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 4,
      published: true,
      featured: false,
      seoTitle: "AI System Integration Services - CerpaMedia",
      seoDescription: "Practical integration of AI capabilities into your existing systems. Implement AI solutions that deliver real value.",
    },
    {
      slug: "ai-consulting",
      title: "AI Consulting",
      shortDesc: "Strategic guidance on adopting AI technologies.",
      longDesc: "Strategic guidance on adopting AI technologies. We help you separate hype from practical applications and make informed decisions about AI investments.",
      description: "Strategic guidance on adopting AI technologies. We help you separate hype from practical applications and make informed decisions about AI investments.",
      features: [
        "AI strategy and roadmap development",
        "Use case identification and validation",
        "Vendor and solution evaluation",
        "Risk assessment and mitigation",
        "Training and knowledge transfer"
      ],
      outcome: "Informed decisions about AI investments for your business",
      priceLabel: "Starting at $2,500",
      price: 2500,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 5,
      published: true,
      featured: false,
      seoTitle: "AI Consulting Services - CerpaMedia",
      seoDescription: "Strategic guidance on adopting AI technologies. Separate hype from practical applications and make informed decisions.",
    },
    {
      slug: "automation-consulting",
      title: "Automation Consulting",
      shortDesc: "Identify and implement automation opportunities across your business processes.",
      longDesc: "Identify and implement automation opportunities across your business processes. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
      description: "Identify and implement automation opportunities across your business processes. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
      features: [
        "Process analysis and mapping",
        "Automation opportunity identification",
        "Tool selection and implementation",
        "Workflow optimization",
        "Monitoring and continuous improvement"
      ],
      outcome: "Reduced manual work and errors, higher-value team activities",
      priceLabel: "Starting at $3,000",
      price: 3000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 6,
      published: true,
      featured: false,
      seoTitle: "Automation Consulting Services - CerpaMedia",
      seoDescription: "Identify and implement automation opportunities. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
    },
    {
      slug: "business-process-improvement-automation",
      title: "Business Process Improvement & Automation",
      shortDesc: "Comprehensive review and optimization of your business processes.",
      longDesc: "Comprehensive review and optimization of your business processes. We combine process improvement methodologies with automation technologies to drive efficiency.",
      description: "Comprehensive review and optimization of your business processes. We combine process improvement methodologies with automation technologies to drive efficiency.",
      features: [
        "Current state assessment",
        "Process redesign and optimization",
        "Automation implementation",
        "Change management support",
        "Metrics and performance tracking"
      ],
      outcome: "Optimized processes that drive efficiency and growth",
      priceLabel: "Starting at $5,000",
      price: 5000,
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 7,
      published: true,
      featured: false,
      seoTitle: "Business Process Improvement & Automation - CerpaMedia",
      seoDescription: "Comprehensive review and optimization of your business processes. Drive efficiency with process improvement and automation.",
    },
    {
      slug: "ai-teammate-launch",
      title: "AI Teammate Launch",
      shortDesc: "Two AI teammates set up and saving you hours every week",
      longDesc: "Two AI teammates set up and saving you hours every week. We pick the right platform (Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork), launch 2 teammates from a starter menu, and set approval rules so nothing sends, spends, or deletes without your OK.",
      description: "We pick the right platform (Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork), launch 2 teammates from a starter menu, and set approval rules so nothing sends, spends, or deletes without your OK. You own the tool accounts and pay vendors directly. If your first teammate isn't saving at least 3 hours a week, we keep fixing it free (60-day window from the launch session).",
      features: [],
      outcome: "Two AI teammates working in 14 days",
      priceLabel: "$799 founding price · Regular $1,199",
      price: 799,
      priceNote: "First 5 clients · Founding rate",
      badgeText: "First 5 clients · Founding rate",
      ctaLabel: "See how it works",
      ctaUrl: "/services/ai-teammate-launch",
      sortOrder: 0,
      published: true,
      featured: true,
      seoTitle: "AI Teammate Launch - CerpaMedia",
      seoDescription: "Your first two AI employees working in 14 days. $799 founding rate for the first 5 clients. We set up the teammates, you own the accounts.",
    },
    {
      slug: "technology-strategy-call",
      title: "Technology Strategy Call",
      shortDesc: "Pay $99 for a 30–45 min call with Roger. Get 3–5 opportunities and a written summary within 24–48 hours.",
      longDesc: "Pay $99 for a 30–45 min call with Roger. Get 3–5 opportunities and a written summary within 24–48 hours. Prepaid standalone — not credited toward discovery or other work. Exception: credited toward AI Teammate Launch if purchased within 30 days.",
      description: "Pay $99 for a 30–45 min call with Roger. Get 3–5 opportunities and a written summary within 24–48 hours. Prepaid standalone — not credited toward discovery or other work. Exception: credited toward AI Teammate Launch if purchased within 30 days.",
      features: [],
      outcome: "Clear next step with 3–5 opportunities",
      priceLabel: "$99",
      price: 99,
      ctaLabel: "Pay $99 — Book Call",
      ctaUrl: "/consult",
      sortOrder: -1,
      published: true,
      featured: false,
      seoTitle: "Technology Strategy Call - $99 - CerpaMedia",
      seoDescription: "30-45 minute call with Roger. Get 3-5 opportunities and a written summary within 24-48 hours. $99 prepaid.",
    },
  ];

  for (const service of services) {
    // Idempotent: match on slug OR title to handle both new and existing rows
    const existing = await prisma.service.findFirst({
      where: {
        OR: [
          { slug: service.slug },
          { title: service.title },
        ],
      },
    });

    if (existing) {
      // Update existing row with new fields, preserving ID
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          slug: service.slug,
          features: service.features,
          outcome: service.outcome,
          description: service.description,
          price: service.price,
          priceNote: service.priceNote,
          badgeText: service.badgeText,
          featured: service.featured,
          seoTitle: service.seoTitle,
          seoDescription: service.seoDescription,
        },
      });
      console.log(`✓ Updated service: ${service.title} (ID: ${existing.id}, slug: ${service.slug})`);
    } else {
      await prisma.service.create({
        data: service,
      });
      console.log(`✓ Created service: ${service.title} (slug: ${service.slug})`);
    }
  }

  // Seed sample insight post
  await prisma.insightPost.upsert({
    where: { slug: "ai-automation-for-small-businesses-2026" },
    update: {},
    create: {
      title: "AI Automation for Small Businesses: What's Actually Working in 2026",
      slug: "ai-automation-for-small-businesses-2026",
      summary:
        "Practical insights on AI tools that small businesses are using today to save time and reduce costs — without the hype.",
      body: `# AI Automation for Small Businesses: What's Actually Working in 2026

Small businesses are finding real value in AI automation — but not where most people think. Instead of futuristic chatbots and prediction engines, the wins are coming from automating repetitive tasks that drain team productivity.

## What's Working

**Document Processing:** Tools like optical character recognition (OCR) paired with AI can extract data from invoices, receipts, and forms automatically. This eliminates manual data entry and reduces errors.

**Email Triage:** AI assistants can categorize incoming emails, flag urgent messages, and even draft responses for common inquiries. This saves hours per week for customer-facing teams.

**Scheduling and Booking:** Smart scheduling systems can handle appointment bookings, send reminders, and manage cancellations without human intervention.

## Where CerpaMedia Helps

We help small businesses identify where automation makes sense and implement practical solutions that deliver ROI. Our approach:

- **Discovery first:** We analyze your operations to find high-impact automation opportunities
- **Practical tech:** We recommend tools that work with your existing systems
- **Implementation support:** We handle the setup and integration so your team can focus on what they do best

## The Bottom Line

AI automation isn't about replacing your team — it's about freeing them from tedious tasks so they can focus on higher-value work. The technology is mature, affordable, and ready for small businesses that want to work smarter.

**Ready to explore automation for your business?** [Book a $99 strategy call](/consult) to discuss opportunities specific to your operations.`,
      tags: ["AI", "automation", "SMB", "productivity", "technology"],
      status: "published",
      publishedAt: new Date("2026-10-01T12:00:00Z"),
    },
  });
  console.log("✓ Created/updated sample insight post");

  // Seed home page content (hero, how-it-works)
  // Extracted from current page.tsx to ensure visual parity
  await prisma.siteContent.upsert({
    where: { key: "home-hero" },
    update: {},
    create: {
      key: "home-hero",
      value: {
        headline: "Stop losing hours to tools that don't talk to each other.",
        subheadline: "CerpaMedia helps small businesses get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
        primaryCtaLabel: "Book the $99 Strategy Call",
        primaryCtaUrl: "/consult",
        secondaryCtaLabel: "Or email Roger",
        secondaryCtaUrl: "mailto:cerpamedia@gmail.com",
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { key: "home-how-it-works" },
    update: {},
    create: {
      key: "home-how-it-works",
      value: {
        steps: [
          {
            title: "Clarity before code",
            description: "Paid discovery maps what to build (and what not to). Then a fixed statement of work with milestones — so you're not buying an open-ended project.",
          },
          {
            title: "You own the system",
            description: "GitHub, hosting, domain, database, and third-party accounts stay in your name. We're a collaborator, not a landlord.",
          },
          {
            title: "Practical over trendy",
            description: "We recommend what your business will actually use next quarter — not a slide deck of buzzwords.",
          },
        ],
      },
    },
  });

  console.log("✓ Created/updated home page site content");

  // Note: FAQ and Testimonials are empty by default (per requirements)
  // No seed data for these - admin must add them manually

  console.log("\n✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
