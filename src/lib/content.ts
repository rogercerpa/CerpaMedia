import { prisma } from "./prisma";
import { resolveHeroContent, type HeroContent } from "./hero-content";

export type { HeroContent, HeroPair } from "./hero-content";
export {
  DEFAULT_HERO_PAIRS,
  LEGACY_HERO_HEADLINE,
  resolveHeroContent,
} from "./hero-content";

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface HowItWorksContent {
  steps: HowItWorksStep[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  link?: string | null;
  sortOrder: number;
}

const fallbackHowItWorks: HowItWorksContent = {
  steps: [
    {
      title: "Clarity before code",
      description: "Paid discovery maps what to build (and what not to). Then a fixed statement of work with milestones — so you're not buying an open-ended project.",
    },
    {
      title: "You own the system",
      description: "GitHub, hosting, domain, database, and third-party accounts stay in <em>your</em> name. We're a collaborator, not a landlord.",
    },
    {
      title: "Practical over trendy",
      description: "We recommend what your business will actually use next quarter — not a slide deck of buzzwords.",
    },
  ],
};

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "home-hero" },
    });

    if (!content) {
      return resolveHeroContent(null);
    }

    return resolveHeroContent(content.value);
  } catch (error) {
    console.error("Failed to fetch hero content from DB:", error);
    return resolveHeroContent(null);
  }
}

export async function getHowItWorksContent(): Promise<HowItWorksContent> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "home-how-it-works" },
    });

    if (!content) {
      return fallbackHowItWorks;
    }

    return content.value as unknown as HowItWorksContent;
  } catch (error) {
    console.error("Failed to fetch how-it-works content from DB:", error);
    return fallbackHowItWorks;
  }
}

export async function getPublishedFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faqItem.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
      },
    });

    return faqs;
  } catch (error) {
    console.error("Failed to fetch FAQs from DB:", error);
    return [];
  }
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        role: true,
        quote: true,
        link: true,
        sortOrder: true,
      },
    });

    return testimonials;
  } catch (error) {
    console.error("Failed to fetch testimonials from DB:", error);
    return [];
  }
}
