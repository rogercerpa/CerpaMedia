/**
 * Availability Engine for CerpaMedia Booking System
 * 
 * Calculates available time slots based on:
 * - Weekly availability rules (weekday + time ranges)
 * - Blocked dates
 * - Existing bookings
 * - Slot settings (length, buffer, min lead time)
 */

import { prisma } from "./prisma";

export interface AvailabilityRule {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface BlockedDate {
  id: string;
  date: Date;
  reason?: string | null;
}

export interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface BookingSettings {
  slotLengthMin: number;
  bufferMin: number;
  minLeadTimeHrs: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * Parse time string (HH:MM) and return minutes since midnight
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:MM
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Get the weekday number (0-6) for a date in a specific timezone
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
function getWeekdayInTimezone(date: Date, timezone: string): number {
  const dateStr = date.toLocaleDateString("en-US", { 
    timeZone: timezone,
    weekday: "long" 
  });
  
  const weekdayMap: { [key: string]: number } = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
  };
  
  return weekdayMap[dateStr] || 0;
}

/**
 * Create a date at a specific time in a timezone
 */
function createDateAtTime(
  date: Date,
  timeStr: string,
  timezone: string
): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Get the date string in the target timezone
  const dateStr = date.toLocaleDateString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  // Parse it back to get year, month, day in the target timezone
  const [month, day, year] = dateStr.split("/").map(Number);
  
  // Create ISO string in the target timezone
  const isoStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  
  // Parse as if it's in the target timezone
  // This is a simplified approach; for production, consider using a library like date-fns-tz
  const localDate = new Date(isoStr);
  const tzOffset = getTimezoneOffset(timezone);
  
  return new Date(localDate.getTime() - tzOffset);
}

/**
 * Get timezone offset in milliseconds
 * Simplified implementation - for production, use a proper timezone library
 */
function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return utcDate.getTime() - tzDate.getTime();
}

/**
 * Check if a date is blocked
 */
function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return blockedDates.some((blocked) => {
    const blockedStr = blocked.date.toISOString().split("T")[0];
    return blockedStr === dateStr;
  });
}

/**
 * Check if a slot overlaps with any existing booking
 */
function overlapsWithBooking(
  slotStart: Date,
  slotEnd: Date,
  bookings: Booking[]
): boolean {
  return bookings.some((booking) => {
    // A slot overlaps if it starts before the booking ends AND ends after the booking starts
    return slotStart < booking.endTime && slotEnd > booking.startTime;
  });
}

/**
 * Generate time slots for a single day based on availability rule
 */
function generateDaySlots(
  date: Date,
  rule: AvailabilityRule,
  settings: BookingSettings,
  timezone: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const startMinutes = parseTime(rule.startTime);
  const endMinutes = parseTime(rule.endTime);
  
  let currentMinutes = startMinutes;
  
  while (currentMinutes + settings.slotLengthMin <= endMinutes) {
    const slotStart = createDateAtTime(
      date,
      formatTime(currentMinutes),
      timezone
    );
    const slotEnd = createDateAtTime(
      date,
      formatTime(currentMinutes + settings.slotLengthMin),
      timezone
    );
    
    slots.push({ start: slotStart, end: slotEnd });
    
    // Move to next slot (slot length + buffer)
    currentMinutes += settings.slotLengthMin + settings.bufferMin;
  }
  
  return slots;
}

/**
 * Get available time slots for a date range
 * 
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  startDate: Date,
  endDate: Date
): Promise<TimeSlot[]> {
  // Fetch all necessary data
  const [rules, blockedDates, bookings, settingsArray] = await Promise.all([
    prisma.availabilityRule.findMany(),
    prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: {
          not: "cancelled",
        },
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.bookingSettings.findMany(),
  ]);

  const settings: BookingSettings = settingsArray.length > 0
    ? {
        slotLengthMin: settingsArray[0].slotLengthMin,
        bufferMin: settingsArray[0].bufferMin,
        minLeadTimeHrs: settingsArray[0].minLeadTimeHrs,
      }
    : {
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 24,
      };

  const allSlots: TimeSlot[] = [];
  const timezone = rules[0]?.timezone || "America/New_York";
  
  // Calculate the earliest allowed booking time
  const minStartTime = new Date(Date.now() + settings.minLeadTimeHrs * 60 * 60 * 1000);

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Skip if date is blocked
    if (!isDateBlocked(currentDate, blockedDates)) {
      // Get the weekday for this date
      const weekday = getWeekdayInTimezone(currentDate, timezone);
      
      // Find availability rules for this weekday
      const dayRules = rules.filter((r) => r.weekday === weekday);
      
      // Generate slots for each rule
      for (const rule of dayRules) {
        const daySlots = generateDaySlots(currentDate, rule, settings, timezone);
        
        // Filter out slots that:
        // 1. Are in the past or within min lead time
        // 2. Overlap with existing bookings
        const availableSlots = daySlots.filter(
          (slot) =>
            slot.start >= minStartTime &&
            !overlapsWithBooking(slot.start, slot.end, bookings)
        );
        
        allSlots.push(...availableSlots);
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const [rules, blockedDates, bookings, settingsArray] = await Promise.all([
    prisma.availabilityRule.findMany(),
    prisma.blockedDate.findMany({
      where: {
        date: startTime,
      },
    }),
    prisma.booking.findMany({
      where: {
        status: {
          not: "cancelled",
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    }),
    prisma.bookingSettings.findMany(),
  ]);

  const settings: BookingSettings = settingsArray.length > 0
    ? {
        slotLengthMin: settingsArray[0].slotLengthMin,
        bufferMin: settingsArray[0].bufferMin,
        minLeadTimeHrs: settingsArray[0].minLeadTimeHrs,
      }
    : {
        slotLengthMin: 60,
        bufferMin: 15,
        minLeadTimeHrs: 24,
      };

  // Check min lead time
  const minStartTime = new Date(Date.now() + settings.minLeadTimeHrs * 60 * 60 * 1000);
  if (startTime < minStartTime) {
    return false;
  }

  // Check if date is blocked
  if (isDateBlocked(startTime, blockedDates)) {
    return false;
  }

  // Check if overlaps with existing bookings
  if (overlapsWithBooking(startTime, endTime, bookings)) {
    return false;
  }

  // Check if within availability rules
  const timezone = rules[0]?.timezone || "America/New_York";
  const weekday = getWeekdayInTimezone(startTime, timezone);
  const dayRules = rules.filter((r) => r.weekday === weekday);

  if (dayRules.length === 0) {
    return false;
  }

  // Extract time from startTime and endTime
  const startTimeStr = startTime.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTimeStr = endTime.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);

  // Check if the slot fits within any availability rule
  return dayRules.some((rule) => {
    const ruleStart = parseTime(rule.startTime);
    const ruleEnd = parseTime(rule.endTime);
    return startMinutes >= ruleStart && endMinutes <= ruleEnd;
  });
}
