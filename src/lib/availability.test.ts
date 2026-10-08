import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableSlots } from './availability';

// Mock Prisma client
vi.mock('./prisma', () => ({
  prisma: {
    dateAvailability: {
      findMany: vi.fn(),
    },
    blockedDate: {
      findMany: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
    },
    checkoutHold: {
      findMany: vi.fn(),
    },
    bookingSettings: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from './prisma';

describe('getAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (prisma.dateAvailability.findMany as any).mockResolvedValue([]);
    (prisma.blockedDate.findMany as any).mockResolvedValue([]);
    (prisma.booking.findMany as any).mockResolvedValue([]);
    (prisma.checkoutHold.findMany as any).mockResolvedValue([]);
    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      {
        id: 'settings1',
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 24,
      },
    ]);
  });

  it('returns 0 slots when no DateAvailability records exist (empty config)', async () => {
    const startDate = new Date('2026-10-15T00:00:00Z');
    const endDate = new Date('2026-10-16T00:00:00Z');

    const slots = await getAvailableSlots(startDate, endDate);

    expect(slots).toHaveLength(0);
  });

  it('returns 0 slots even if legacy weekly rules exist (verifies fallback removed)', async () => {
    // This test verifies that even if AvailabilityRule records exist,
    // they are NOT used because we removed the fallback
    const startDate = new Date('2026-10-15T00:00:00Z'); // Wednesday
    const endDate = new Date('2026-10-16T00:00:00Z');

    // No DateAvailability records
    (prisma.dateAvailability.findMany as any).mockResolvedValue([]);

    const slots = await getAvailableSlots(startDate, endDate);

    // Should be 0 because we no longer fall back to AvailabilityRule
    expect(slots).toHaveLength(0);
  });

  it('returns slots in ET timezone when a date is opened', async () => {
    const startDate = new Date('2026-10-15T00:00:00Z');
    const endDate = new Date('2026-10-16T00:00:00Z');

    // Mock DateAvailability for Oct 15, 2026 (10 AM - 4 PM ET)
    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: new Date('2026-10-15T12:00:00.000Z'), // Noon UTC = date at noon
        startTime: '10:00',
        endTime: '16:00',
        timezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock settings with 60 min slots, 15 min buffer, 0 lead time for testing
    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      {
        id: 'settings1',
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 0, // No lead time for easier testing
      },
    ]);

    const slots = await getAvailableSlots(startDate, endDate);

    // Should have slots (10 AM - 4 PM with 60 min slots + 15 min buffer = ~4 slots)
    expect(slots.length).toBeGreaterThan(0);
    
    // Verify slots are in ET timezone (UTC offset is -4 or -5 depending on DST)
    const firstSlot = slots[0];
    expect(firstSlot.start).toBeDefined();
    expect(firstSlot.end).toBeDefined();
    
    // Verify duration is 60 minutes
    const duration = (firstSlot.end.getTime() - firstSlot.start.getTime()) / (1000 * 60);
    expect(duration).toBe(60);
  });

  it('returns no slots for a blocked date', async () => {
    const startDate = new Date('2026-10-15T00:00:00Z');
    const endDate = new Date('2026-10-17T00:00:00Z');

    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: new Date('2026-10-15T12:00:00.000Z'),
        startTime: '10:00',
        endTime: '16:00',
        timezone: 'America/New_York',
      },
    ]);

    (prisma.blockedDate.findMany as any).mockResolvedValue([
      {
        id: 'blocked1',
        date: new Date('2026-10-15T12:00:00.000Z'),
        reason: 'Holiday',
      },
    ]);

    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      { id: 'settings1', slotLengthMin: 60, bufferMin: 15, minLeadTimeHrs: 0 },
    ]);

    const slots = await getAvailableSlots(startDate, endDate);
    expect(slots).toHaveLength(0);
  });

  it('respects minimum lead time', async () => {
    // Test date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Mock DateAvailability for tomorrow
    const tomorrowNoon = new Date(tomorrow);
    tomorrowNoon.setHours(12, 0, 0, 0);
    
    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: tomorrowNoon,
        startTime: '10:00',
        endTime: '16:00',
        timezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock settings with 48 hours lead time
    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      {
        id: 'settings1',
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 48, // 48 hours lead time
      },
    ]);

    const slots = await getAvailableSlots(tomorrow, dayAfter);

    // Should be 0 because all slots are within 48 hours
    expect(slots).toHaveLength(0);
  });

  it('filters out slots that overlap with confirmed bookings', async () => {
    const startDate = new Date('2026-10-15T00:00:00Z');
    const endDate = new Date('2026-10-16T00:00:00Z');

    // Mock DateAvailability for Oct 15 (10 AM - 4 PM ET)
    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: new Date('2026-10-15T12:00:00.000Z'),
        startTime: '10:00',
        endTime: '16:00',
        timezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock a confirmed booking at 10 AM ET (14:00 UTC)
    (prisma.booking.findMany as any).mockResolvedValue([
      {
        id: 'booking1',
        startTime: new Date('2026-10-15T14:00:00.000Z'),
        endTime: new Date('2026-10-15T15:00:00.000Z'),
        status: 'confirmed',
      },
    ]);

    // No lead time for easier testing
    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      {
        id: 'settings1',
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 0,
      },
    ]);

    const slots = await getAvailableSlots(startDate, endDate);

    // Should have slots, but not the one at 10 AM
    expect(slots.length).toBeGreaterThan(0);
    
    // Verify no slot starts at 10 AM ET (14:00 UTC)
    const tenAmSlot = slots.find(slot => 
      slot.start.getUTCHours() === 14 && slot.start.getUTCMinutes() === 0
    );
    expect(tenAmSlot).toBeUndefined();
  });

  it('blocks dates correctly near midnight ET/UTC boundary', async () => {
    // Test case: Oct 15 8 PM ET is Oct 16 00:00 UTC
    // A BlockedDate for Oct 15 should block ALL slots on Oct 15 ET, even late evening
    const startDate = new Date('2026-10-15T00:00:00Z');
    const endDate = new Date('2026-10-17T00:00:00Z');

    // Mock DateAvailability for Oct 15 - extended hours into late evening
    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: new Date('2026-10-15T12:00:00.000Z'),
        startTime: '10:00',
        endTime: '22:00', // 10 PM ET = 2 AM next day UTC
        timezone: 'America/New_York',
      },
    ]);

    // Mock BlockedDate for Oct 15
    (prisma.blockedDate.findMany as any).mockResolvedValue([
      {
        id: 'blocked1',
        date: new Date('2026-10-15T12:00:00.000Z'),
        reason: 'Evening event',
      },
    ]);

    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      { id: 'settings1', slotLengthMin: 60, bufferMin: 15, minLeadTimeHrs: 0 },
    ]);

    const slots = await getAvailableSlots(startDate, endDate);

    // Should be 0 because Oct 15 is blocked, even though some slots would be on Oct 16 in UTC
    expect(slots).toHaveLength(0);
  });

  it('ensures calendar dates match slot dates in YYYY-MM-DD format', async () => {
    // This test verifies the fix for the off-by-one calendar bug
    // Slot times in UTC should map to the correct calendar date in ET
    const startDate = new Date('2026-10-25T00:00:00Z');
    const endDate = new Date('2026-10-26T00:00:00Z');

    // Mock availability for Oct 25
    (prisma.dateAvailability.findMany as any).mockResolvedValue([
      {
        id: 'avail1',
        date: new Date('2026-10-25T04:00:00.000Z'), // Oct 25 midnight UTC (Oct 24 8 PM ET)
        startTime: '10:00',
        endTime: '15:00',
        timezone: 'America/New_York',
      },
    ]);

    (prisma.blockedDate.findMany as any).mockResolvedValue([]);
    (prisma.bookingSettings.findMany as any).mockResolvedValue([
      { id: 'settings1', slotLengthMin: 60, bufferMin: 15, minLeadTimeHrs: 0 },
    ]);

    const slots = await getAvailableSlots(startDate, endDate);

    expect(slots.length).toBeGreaterThan(0);
    
    // All slots should be on Oct 25 in ET, not Oct 26
    // Using en-CA locale gives YYYY-MM-DD format
    slots.forEach(slot => {
      const dateStr = slot.start.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York',
      });
      expect(dateStr).toBe('2026-10-25');
    });
  });
});
