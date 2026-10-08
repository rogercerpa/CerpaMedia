import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, PATCH } from '@/app/api/admin/services/[id]/route';
import { POST as reorderPost } from '@/app/api/admin/services/[id]/reorder/route';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      update: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  getAdminSession: vi.fn(),
}));

describe('Service API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminSession).mockResolvedValue('admin@example.com');
  });

  describe('DELETE /api/admin/services/[id]', () => {
    it('should soft delete a service', async () => {
      const mockService = {
        id: 'service-1',
        title: 'Test Service',
        deletedAt: new Date(),
        published: false,
      };

      vi.mocked(prisma.service.update).mockResolvedValue(mockService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await DELETE(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 'service-1' },
        data: {
          deletedAt: expect.any(Date),
          published: false,
        },
      });
      expect(data.service).toBeDefined();
    });

    it('should require authentication', async () => {
      vi.mocked(getAdminSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await DELETE(request, context);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/admin/services/[id]', () => {
    it('should update published status', async () => {
      const mockService = {
        id: 'service-1',
        published: true,
      };

      vi.mocked(prisma.service.update).mockResolvedValue(mockService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1', {
        method: 'PATCH',
        body: JSON.stringify({ published: true }),
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 'service-1' },
        data: { published: true },
      });
      expect(data.service).toBeDefined();
    });
  });

  describe('POST /api/admin/services/[id]/reorder', () => {
    it('should reorder service up', async () => {
      const currentService = {
        id: 'service-1',
        sortOrder: 2,
      };
      const swapService = {
        id: 'service-2',
        sortOrder: 1,
      };

      vi.mocked(prisma.service.findUnique).mockResolvedValue(currentService as any);
      vi.mocked(prisma.service.findFirst).mockResolvedValue(swapService as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as any);

      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1/reorder', {
        method: 'POST',
        body: JSON.stringify({ direction: 'up' }),
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await reorderPost(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          sortOrder: { lt: 2 },
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });
      expect(data.success).toBe(true);
    });

    it('should reorder service down', async () => {
      const currentService = {
        id: 'service-1',
        sortOrder: 1,
      };
      const swapService = {
        id: 'service-2',
        sortOrder: 2,
      };

      vi.mocked(prisma.service.findUnique).mockResolvedValue(currentService as any);
      vi.mocked(prisma.service.findFirst).mockResolvedValue(swapService as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as any);

      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1/reorder', {
        method: 'POST',
        body: JSON.stringify({ direction: 'down' }),
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await reorderPost(request, context);

      expect(response.status).toBe(200);
      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          sortOrder: { gt: 1 },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });
    });

    it('should validate direction parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/services/service-1/reorder', {
        method: 'POST',
        body: JSON.stringify({ direction: 'invalid' }),
      });
      const context = { params: Promise.resolve({ id: 'service-1' }) };

      const response = await reorderPost(request, context);

      expect(response.status).toBe(400);
    });
  });
});
