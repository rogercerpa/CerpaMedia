import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  const services = [
    {
      title: "Web Development",
      shortDesc:
        "Custom websites and web applications tailored to your business requirements.",
      longDesc:
        "Custom websites and web applications tailored to your business requirements. We build responsive, fast, and user-friendly solutions that work across all devices.",
      priceLabel: "Starting at $5,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 1,
      published: true,
    },
    {
      title: "Web Applications",
      shortDesc:
        "Complex web applications that power your business operations.",
      longDesc:
        "Complex web applications that power your business operations. From customer portals to internal management systems, we build scalable solutions.",
      priceLabel: "Starting at $10,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 2,
      published: true,
    },
    {
      title: "Mobile Apps",
      shortDesc:
        "Native and cross-platform mobile applications for iOS and Android.",
      longDesc:
        "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions your customers can access anywhere.",
      priceLabel: "Starting at $15,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 3,
      published: true,
    },
    {
      title: "AI System Integration",
      shortDesc:
        "Practical integration of AI capabilities into your existing systems.",
      longDesc:
        "Practical integration of AI capabilities into your existing systems. We help you understand where AI makes sense and implement solutions that deliver real value.",
      priceLabel: "Starting at $8,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 4,
      published: true,
    },
    {
      title: "AI Consulting",
      shortDesc:
        "Strategic guidance on adopting AI technologies.",
      longDesc:
        "Strategic guidance on adopting AI technologies. We help you separate hype from practical applications and make informed decisions about AI investments.",
      priceLabel: "Starting at $2,500",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 5,
      published: true,
    },
    {
      title: "Automation Consulting",
      shortDesc:
        "Identify and implement automation opportunities across your business processes.",
      longDesc:
        "Identify and implement automation opportunities across your business processes. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
      priceLabel: "Starting at $3,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 6,
      published: true,
    },
    {
      title: "Business Process Improvement & Automation",
      shortDesc:
        "Comprehensive review and optimization of your business processes.",
      longDesc:
        "Comprehensive review and optimization of your business processes. We combine process improvement methodologies with automation technologies to drive efficiency.",
      priceLabel: "Starting at $5,000",
      ctaLabel: "Get a Quote",
      ctaUrl: "/contact",
      sortOrder: 7,
      published: true,
    },
    {
      title: "Technology Strategy Call",
      shortDesc:
        "60-minute consultation to discuss your technology needs and opportunities.",
      longDesc:
        "Book a 60-minute one-on-one consultation call to discuss your business technology needs, challenges, and opportunities. Perfect for getting expert guidance on your next technology project or understanding how to leverage technology for your business growth.",
      priceLabel: "$99",
      ctaLabel: "Book Now",
      ctaUrl: "/consult",
      sortOrder: 0,
      published: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { title: service.title },
      update: service,
      create: service,
    });
    console.log(`✓ Created/updated service: ${service.title}`);
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

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
