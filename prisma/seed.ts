import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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
