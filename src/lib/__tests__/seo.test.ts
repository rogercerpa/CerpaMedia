import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getSeoMeta, buildMetadata } from '@/lib/seo';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    seoMeta: {
      findUnique: vi.fn(),
    },
  },
}));

describe('SEO Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSeoMeta', () => {
    it('should return SEO metadata from DB', async () => {
      const mockMeta = {
        id: '1',
        path: '/',
        title: 'Custom Home Title',
        description: 'Custom Home Description',
        ogImageUrl: 'https://example.com/og.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(mockMeta as any);

      const result = await getSeoMeta('/');

      expect(result.title).toBe('Custom Home Title');
      expect(result.description).toBe('Custom Home Description');
      expect(result.ogImageUrl).toBe('https://example.com/og.png');
    });

    it('should return empty object when DB returns null', async () => {
      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(null);

      const result = await getSeoMeta('/');

      expect(result).toEqual({});
    });

    it('should return empty object when DB meta is empty', async () => {
      const mockMeta = {
        id: '1',
        path: '/',
        title: null,
        description: null,
        ogImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(mockMeta as any);

      const result = await getSeoMeta('/');

      expect(result).toEqual({});
    });

    it('should return empty object on error', async () => {
      vi.mocked(prisma.seoMeta.findUnique).mockRejectedValue(new Error('DB error'));

      const result = await getSeoMeta('/');

      expect(result).toEqual({});
    });

    it('should return only DB fields that are set', async () => {
      const mockMeta = {
        id: '1',
        path: '/services',
        title: 'Custom Services Title',
        description: null,
        ogImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(mockMeta as any);

      const result = await getSeoMeta('/services');

      expect(result.title).toBe('Custom Services Title');
      expect(result.description).toBeUndefined();
    });
  });

  describe('buildMetadata', () => {
    it('should build metadata with SEO values', async () => {
      const mockMeta = {
        id: '1',
        path: '/',
        title: 'Test Title',
        description: 'Test Description',
        ogImageUrl: 'https://example.com/og.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(mockMeta as any);

      const result = await buildMetadata('/');

      expect(result.title).toBe('Test Title');
      expect(result.description).toBe('Test Description');
      expect(result.openGraph?.images).toEqual(['https://example.com/og.png']);
    });

    it('should merge overrides', async () => {
      const mockMeta = {
        id: '1',
        path: '/',
        title: 'Test Title',
        description: 'Test Description',
        ogImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.seoMeta.findUnique).mockResolvedValue(mockMeta as any);

      const result = await buildMetadata('/', { keywords: ['test', 'keywords'] });

      expect(result.title).toBe('Test Title');
      expect(result.keywords).toEqual(['test', 'keywords']);
    });
  });
});
