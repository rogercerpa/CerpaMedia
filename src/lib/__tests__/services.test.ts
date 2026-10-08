import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getPublishedServices, getServiceBySlug } from '@/lib/services';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Service Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublishedServices', () => {
    it('should return only published, non-deleted services', async () => {
      const mockServices = [
        {
          slug: 'web-development',
          title: 'Web Development',
          description: 'Custom websites',
          shortDesc: 'Custom websites',
          outcome: 'Great websites',
          priceLabel: '$5,000',
          badgeText: null,
          featured: false,
          ctaLabel: 'Get a Quote',
          ctaUrl: '/contact',
          sortOrder: 1,
        },
      ];

      vi.mocked(prisma.service.findMany).mockResolvedValue(mockServices as any);

      const result = await getPublishedServices();

      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
          deletedAt: null,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { title: 'asc' },
        ],
        select: expect.any(Object),
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Web Development');
    });

    it('should return empty array on error', async () => {
      vi.mocked(prisma.service.findMany).mockRejectedValue(new Error('DB error'));

      const result = await getPublishedServices();

      expect(result).toEqual([]);
    });

    it('should filter services by published and deletedAt', async () => {
      vi.mocked(prisma.service.findMany).mockResolvedValue([]);

      await getPublishedServices();

      expect(prisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            published: true,
            deletedAt: null,
          },
        })
      );
    });

    it('should order by sortOrder then title', async () => {
      vi.mocked(prisma.service.findMany).mockResolvedValue([]);

      await getPublishedServices();

      expect(prisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { sortOrder: 'asc' },
            { title: 'asc' },
          ],
        })
      );
    });
  });

  describe('getServiceBySlug', () => {
    it('should return service by slug', async () => {
      const mockService = {
        slug: 'web-development',
        title: 'Web Development',
        description: 'Custom websites',
        shortDesc: 'Custom websites',
        outcome: 'Great websites',
        priceLabel: '$5,000',
        badgeText: null,
        featured: false,
        ctaLabel: 'Get a Quote',
        ctaUrl: '/contact',
        sortOrder: 1,
      };

      vi.mocked(prisma.service.findFirst).mockResolvedValue(mockService as any);

      const result = await getServiceBySlug('web-development');

      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: {
          slug: 'web-development',
          published: true,
          deletedAt: null,
        },
        select: expect.any(Object),
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Web Development');
    });

    it('should return null if service not found', async () => {
      vi.mocked(prisma.service.findFirst).mockResolvedValue(null);

      const result = await getServiceBySlug('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(prisma.service.findFirst).mockRejectedValue(new Error('DB error'));

      const result = await getServiceBySlug('web-development');

      expect(result).toBeNull();
    });

    it('should only query published and non-deleted services', async () => {
      vi.mocked(prisma.service.findFirst).mockResolvedValue(null);

      await getServiceBySlug('test-slug');

      expect(prisma.service.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: 'test-slug',
            published: true,
            deletedAt: null,
          },
        })
      );
    });
  });
});
