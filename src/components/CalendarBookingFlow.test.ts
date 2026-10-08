import { describe, it, expect } from 'vitest';
import { toLocalDateKey } from './CalendarBookingFlow';

describe('toLocalDateKey', () => {
  it('builds YYYY-MM-DD from local date components without timezone conversion', () => {
    const date = new Date(2026, 9, 25); // Oct 25, 2026 local time
    expect(toLocalDateKey(date)).toBe('2026-10-25');
  });

  it('works correctly regardless of process timezone', () => {
    // Save original TZ
    const originalTZ = process.env.TZ;
    
    try {
      // Test in America/New_York
      process.env.TZ = 'America/New_York';
      const dateNY = new Date(2026, 9, 25);
      expect(toLocalDateKey(dateNY)).toBe('2026-10-25');
      
      // Test in UTC
      process.env.TZ = 'UTC';
      const dateUTC = new Date(2026, 9, 25);
      expect(toLocalDateKey(dateUTC)).toBe('2026-10-25');
      
      // Test in Asia/Tokyo
      process.env.TZ = 'Asia/Tokyo';
      const dateTokyo = new Date(2026, 9, 25);
      expect(toLocalDateKey(dateTokyo)).toBe('2026-10-25');
      
      // Test in America/Los_Angeles
      process.env.TZ = 'America/Los_Angeles';
      const dateLA = new Date(2026, 9, 25);
      expect(toLocalDateKey(dateLA)).toBe('2026-10-25');
      
      // Test in Europe/Madrid
      process.env.TZ = 'Europe/Madrid';
      const dateMadrid = new Date(2026, 9, 25);
      expect(toLocalDateKey(dateMadrid)).toBe('2026-10-25');
    } finally {
      // Restore original TZ
      process.env.TZ = originalTZ;
    }
  });

  it('handles date boundaries correctly', () => {
    expect(toLocalDateKey(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(toLocalDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toLocalDateKey(new Date(2026, 1, 28))).toBe('2026-02-28');
  });

  it('pads single-digit months and days', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toLocalDateKey(new Date(2026, 8, 9))).toBe('2026-09-09');
  });
});
