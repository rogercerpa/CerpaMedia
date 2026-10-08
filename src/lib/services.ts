import { prisma } from "./prisma";

export interface ServiceCard {
  slug: string;
  title: string;
  description: string;
  features: string[];
  outcome?: string;
  priceLabel: string;
  badgeText?: string;
  featured: boolean;
  ctaLabel: string;
  ctaUrl: string;
  sortOrder: number;
}

/**
 * Get all published, non-deleted services ordered by sortOrder
 */
export async function getPublishedServices(): Promise<ServiceCard[]> {
  try {
    const services = await prisma.service.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      orderBy: [
        { sortOrder: "asc" },
        { title: "asc" },
      ],
      select: {
        slug: true,
        title: true,
        description: true,
        shortDesc: true,
        features: true,
        outcome: true,
        priceLabel: true,
        badgeText: true,
        featured: true,
        ctaLabel: true,
        ctaUrl: true,
        sortOrder: true,
      },
    });

    return services.map((s) => ({
      slug: s.slug || "",
      title: s.title,
      description: s.description || s.shortDesc,
      features: s.features,
      outcome: s.outcome || undefined,
      priceLabel: s.priceLabel,
      badgeText: s.badgeText || undefined,
      featured: s.featured,
      ctaLabel: s.ctaLabel,
      ctaUrl: s.ctaUrl,
      sortOrder: s.sortOrder,
    }));
  } catch (error) {
    console.error("Failed to fetch services from DB:", error);
    return [];
  }
}

/**
 * Get a single service by slug
 */
export async function getServiceBySlug(slug: string): Promise<ServiceCard | null> {
  try {
    const service = await prisma.service.findFirst({
      where: {
        slug,
        published: true,
        deletedAt: null,
      },
      select: {
        slug: true,
        title: true,
        description: true,
        shortDesc: true,
        features: true,
        outcome: true,
        priceLabel: true,
        badgeText: true,
        featured: true,
        ctaLabel: true,
        ctaUrl: true,
        sortOrder: true,
      },
    });

    if (!service) {
      return null;
    }

    return {
      slug: service.slug || "",
      title: service.title,
      description: service.description || service.shortDesc,
      features: service.features,
      outcome: service.outcome || undefined,
      priceLabel: service.priceLabel,
      badgeText: service.badgeText || undefined,
      featured: service.featured,
      ctaLabel: service.ctaLabel,
      ctaUrl: service.ctaUrl,
      sortOrder: service.sortOrder,
    };
  } catch (error) {
    console.error(`Failed to fetch service ${slug} from DB:`, error);
    return null;
  }
}

/**
 * Fallback services (current hardcoded content) for when DB is unavailable
 */
export const fallbackServices: ServiceCard[] = [
  {
    slug: "web-development",
    title: "Web Development",
    description: "Custom websites and web applications tailored to your business requirements. We build responsive, fast, and user-friendly solutions that work across all devices.",
    features: [
      "Custom website design and development",
      "Responsive design for mobile and desktop",
      "Content management systems",
      "E-commerce solutions",
      "Performance optimization"
    ],
    priceLabel: "Starting at $5,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 1,
  },
  {
    slug: "web-applications",
    title: "Web Applications",
    description: "Complex web applications that power your business operations. From customer portals to internal management systems, we build scalable solutions.",
    features: [
      "Custom business applications",
      "Database design and integration",
      "API development and integration",
      "User authentication and security",
      "Cloud hosting and deployment"
    ],
    priceLabel: "Starting at $10,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 2,
  },
  {
    slug: "mobile-apps",
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for iOS and Android. Extend your business reach with mobile solutions your customers can access anywhere.",
    features: [
      "iOS and Android app development",
      "Cross-platform solutions",
      "Mobile-first design approach",
      "App store submission and updates",
      "Push notifications and offline functionality"
    ],
    priceLabel: "Starting at $15,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 3,
  },
  {
    slug: "ai-system-integration",
    title: "AI System Integration",
    description: "Practical integration of AI capabilities into your existing systems. We help you understand where AI makes sense and implement solutions that deliver real value.",
    features: [
      "AI feasibility assessment",
      "Integration with existing systems",
      "Natural language processing",
      "Machine learning model implementation",
      "AI-powered automation"
    ],
    priceLabel: "Starting at $8,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 4,
  },
  {
    slug: "ai-consulting",
    title: "AI Consulting",
    description: "Strategic guidance on adopting AI technologies. We help you separate hype from practical applications and make informed decisions about AI investments.",
    features: [
      "AI strategy and roadmap development",
      "Use case identification and validation",
      "Vendor and solution evaluation",
      "Risk assessment and mitigation",
      "Training and knowledge transfer"
    ],
    priceLabel: "Starting at $2,500",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 5,
  },
  {
    slug: "automation-consulting",
    title: "Automation Consulting",
    description: "Identify and implement automation opportunities across your business processes. Reduce manual work, minimize errors, and free up your team for higher-value activities.",
    features: [
      "Process analysis and mapping",
      "Automation opportunity identification",
      "Tool selection and implementation",
      "Workflow optimization",
      "Monitoring and continuous improvement"
    ],
    priceLabel: "Starting at $3,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 6,
  },
  {
    slug: "business-process-improvement-automation",
    title: "Business Process Improvement & Automation",
    description: "Comprehensive review and optimization of your business processes. We combine process improvement methodologies with automation technologies to drive efficiency.",
    features: [
      "Current state assessment",
      "Process redesign and optimization",
      "Automation implementation",
      "Change management support",
      "Metrics and performance tracking"
    ],
    priceLabel: "Starting at $5,000",
    featured: false,
    ctaLabel: "Get a Quote",
    ctaUrl: "/contact",
    sortOrder: 7,
  },
];

/**
 * Fallback featured card for AI Teammate Launch
 */
export const fallbackFeaturedService: ServiceCard = {
  slug: "ai-teammate-launch",
  title: "Two AI teammates set up and saving you hours every week",
  description: "We pick the right platform (Grok Bot, OpenAI Dots, Meta Muse, or Claude Cowork), launch 2 teammates from a starter menu, and set approval rules so nothing sends, spends, or deletes without your OK.",
  features: [],
  priceLabel: "$799 founding price for the first 5 clients · Regular $1,199",
  badgeText: "First 5 clients · Founding rate",
  featured: true,
  ctaLabel: "See how it works",
  ctaUrl: "/services/ai-teammate-launch",
  sortOrder: 0,
};
