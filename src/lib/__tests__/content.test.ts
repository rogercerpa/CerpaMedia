import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  getHeroContent,
  getHowItWorksContent,
  getPublishedFaqs,
  getPublishedTestimonials,
} from '@/lib/content';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    siteContent: {
      findUnique: vi.fn(),
    },
    faqItem: {
      findMany: vi.fn(),
    },
    testimonial: {
      findMany: vi.fn(),
    },
  },
}));

describe('Content Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHeroContent', () => {
    it('should return hero content from DB', async () => {
      const mockContent = {
        id: '1',
        key: 'home-hero',
        value: {
          headline: 'Test Headline',
          subheadline: 'Test Subheadline',
          primaryCtaLabel: 'Primary CTA',
          primaryCtaUrl: '/test',
          secondaryCtaLabel: 'Secondary CTA',
          secondaryCtaUrl: 'mailto:test@example.com',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.siteContent.findUnique).mockResolvedValue(mockContent as any);

      const result = await getHeroContent();

      expect(result.headline).toBe('Test Headline');
      expect(result.primaryCtaLabel).toBe('Primary CTA');
    });

    it('should return fallback on DB error', async () => {
      vi.mocked(prisma.siteContent.findUnique).mockRejectedValue(new Error('DB error'));

      const result = await getHeroContent();

      expect(result.headline).toBe("Stop losing hours to tools that don't talk to each other.");
    });

    it('should return fallback if content not found', async () => {
      vi.mocked(prisma.siteContent.findUnique).mockResolvedValue(null);

      const result = await getHeroContent();

      expect(result.headline).toBe("Stop losing hours to tools that don't talk to each other.");
    });
  });

  describe('getHowItWorksContent', () => {
    it('should return how-it-works content from DB', async () => {
      const mockContent = {
        id: '2',
        key: 'home-how-it-works',
        value: {
          steps: [
            { title: 'Step 1', description: 'Description 1' },
            { title: 'Step 2', description: 'Description 2' },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.siteContent.findUnique).mockResolvedValue(mockContent as any);

      const result = await getHowItWorksContent();

      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].title).toBe('Step 1');
    });

    it('should return fallback on error', async () => {
      vi.mocked(prisma.siteContent.findUnique).mockRejectedValue(new Error('DB error'));

      const result = await getHowItWorksContent();

      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].title).toBe('Clarity before code');
    });
  });

  describe('getPublishedFaqs', () => {
    it('should return published FAQs', async () => {
      const mockFaqs = [
        {
          id: '1',
          question: 'Q1',
          answer: 'A1',
          sortOrder: 0,
        },
        {
          id: '2',
          question: 'Q2',
          answer: 'A2',
          sortOrder: 1,
        },
      ];

      vi.mocked(prisma.faqItem.findMany).mockResolvedValue(mockFaqs as any);

      const result = await getPublishedFaqs();

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('Q1');

      expect(prisma.faqItem.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
          deletedAt: null,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
        select: expect.any(Object),
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(prisma.faqItem.findMany).mockRejectedValue(new Error('DB error'));

      const result = await getPublishedFaqs();

      expect(result).toEqual([]);
    });
  });

  describe('getPublishedTestimonials', () => {
    it('should return published testimonials', async () => {
      const mockTestimonials = [
        {
          id: '1',
          name: 'John Doe',
          role: 'CEO',
          quote: 'Great service',
          link: 'https://example.com',
          sortOrder: 0,
        },
      ];

      vi.mocked(prisma.testimonial.findMany).mockResolvedValue(mockTestimonials as any);

      const result = await getPublishedTestimonials();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');

      expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
          deletedAt: null,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
        select: expect.any(Object),
      });
    });

    it('should return empty array on error', async () => {
      vi.mocked(prisma.testimonial.findMany).mockRejectedValue(new Error('DB error'));

      const result = await getPublishedTestimonials();

      expect(result).toEqual([]);
    });
  });
});
