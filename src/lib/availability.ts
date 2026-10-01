/**
 * Availability Engine for CerpaMedia Booking System
 * 
 * Calculates available time slots based on:
 * - Date-specific availability (preferred)
 * - Weekly availability rules (weekday + time ranges, fallback)
 * - Blocked dates
 * - Existing bookings
 * - Slot settings (length, buffer, min lead time)
 */

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { fromZonedTime, toZonedTime, format } from "date-fns-tz";
import { parseISO, addMinutes, startOfDay } from "date-fns";
import { formatCalendarDate } from "./calendar-date";

/**
 * Safely extract database hostname from DATABASE_URL
 * Returns only the hostname (no credentials, port, or query params)
 */
export function getDatabaseHost(): string | null {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return null;
    
    const url = new URL(dbUrl);
    return url.hostname;
  } catch {
    return null;
  }
}

export class AvailabilityError extends Error {
  constructor(
    message: string,
    public code: string,
    public prismaCode?: string,
    public hint?: string
  ) {
    super(message);
    this.name = "AvailabilityError";
  }
}

export interface AvailabilityRule {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface DateAvailability {
  id: string;
  date: Date;
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
 * Get the weekday number (0-6) for a date in a specific timezone using date-fns-tz
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
function getWeekdayInTimezone(date: Date, timezone: string): number {
  const zonedDate = toZonedTime(date, timezone);
  return zonedDate.getDay();
}

/**
 * Create a date at a specific time in a timezone using date-fns-tz
 * Properly handles timezone conversions and DST transitions
 */
function createDateAtTime(
  date: Date,
  timeStr: string,
  timezone: string
): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  const zonedDate = toZonedTime(date, timezone);
  const dateString = format(zonedDate, "yyyy-MM-dd", { timeZone: timezone });
  const isoString = `${dateString}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  
  return fromZonedTime(isoString, timezone);
}

/**
 * Check if a date is blocked
 * Uses UTC calendar date comparison (noon UTC dates)
 */
function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const dateStr = formatCalendarDate(date);
  return blockedDates.some((blocked) => {
    const blockedStr = formatCalendarDate(blocked.date);
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
 * Generate time slots for a single day based on start/end times
 */
function generateDaySlots(
  date: Date,
  startTime: string,
  endTime: string,
  settings: BookingSettings,
  timezone: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  
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
  let rules: AvailabilityRule[];
  let dateAvailabilities: DateAvailability[];
  let blockedDates: BlockedDate[];
  let bookings: Booking[];
  let settingsArray: BookingSettings[];

  try {
    rules = await prisma.availabilityRule.findMany();
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch availability rules",
      "SLOTS_RULES_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if AvailabilityRule table exists` : "Database query failed"
    );
  }

  try {
    dateAvailabilities = await prisma.dateAvailability.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    if (prismaCode === "P2021") {
      dateAvailabilities = [];
    } else {
      throw new AvailabilityError(
        "Failed to fetch date availabilities",
        "SLOTS_DATE_AVAIL_FAILED",
        prismaCode,
        prismaCode ? `Prisma error ${prismaCode} - run 'prisma db push' to sync schema` : "Database query failed"
      );
    }
  }

  try {
    blockedDates = await prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch blocked dates",
      "SLOTS_BLOCKED_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if BlockedDate table exists` : "Database query failed"
    );
  }

  try {
    bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { status: "confirmed" },
          { status: "pending" },
        ],
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch bookings",
      "SLOTS_BOOKINGS_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if Booking table exists and has required columns` : "Database query failed"
    );
  }

  try {
    settingsArray = await prisma.bookingSettings.findMany();
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    
    // If BookingSettings table is missing (P2021), fall back to defaults with a warning
    if (prismaCode === "P2021") {
      console.warn("[SLOTS_SETTINGS_MISSING_FALLBACK] BookingSettings table not found, using defaults", {
        code: "SLOTS_SETTINGS_MISSING_FALLBACK",
        prismaCode,
        defaults: { slotLengthMin: 60, bufferMin: 15, minLeadTimeHrs: 24 },
        dbHost: getDatabaseHost(),
      });
      settingsArray = [];
    } else {
      // Other database errors are still hard failures
      throw new AvailabilityError(
        "Failed to fetch booking settings",
        "SLOTS_SETTINGS_FAILED",
        prismaCode,
        prismaCode ? `Prisma error ${prismaCode} - unexpected database error` : "Database query failed"
      );
    }
  }

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
  const timezone = dateAvailabilities[0]?.timezone || rules[0]?.timezone || "America/New_York";
  
  const minStartTime = new Date(Date.now() + settings.minLeadTimeHrs * 60 * 60 * 1000);

  const dateAvailMap = new Map<string, DateAvailability[]>();
  for (const avail of dateAvailabilities) {
    const dateStr = format(toZonedTime(avail.date, timezone), "yyyy-MM-dd", { timeZone: timezone });
    if (!dateAvailMap.has(dateStr)) {
      dateAvailMap.set(dateStr, []);
    }
    dateAvailMap.get(dateStr)!.push(avail);
  }

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (!isDateBlocked(currentDate, blockedDates)) {
      const dateStr = format(toZonedTime(currentDate, timezone), "yyyy-MM-dd", { timeZone: timezone });
      const dateAvails = dateAvailMap.get(dateStr);
      
      if (dateAvails && dateAvails.length > 0) {
        for (const avail of dateAvails) {
          const daySlots = generateDaySlots(
            currentDate,
            avail.startTime,
            avail.endTime,
            settings,
            avail.timezone
          );
          
          const availableSlots = daySlots.filter(
            (slot) =>
              slot.start >= minStartTime &&
              !overlapsWithBooking(slot.start, slot.end, bookings)
          );
          
          allSlots.push(...availableSlots);
        }
      } else if (rules.length > 0) {
        const weekday = getWeekdayInTimezone(currentDate, timezone);
        const dayRules = rules.filter((r) => r.weekday === weekday);
        
        for (const rule of dayRules) {
          const daySlots = generateDaySlots(
            currentDate,
            rule.startTime,
            rule.endTime,
            settings,
            rule.timezone
          );
          
          const availableSlots = daySlots.filter(
            (slot) =>
              slot.start >= minStartTime &&
              !overlapsWithBooking(slot.start, slot.end, bookings)
          );
          
          allSlots.push(...availableSlots);
        }
      }
    }
    
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
  let rules: AvailabilityRule[];
  let dateAvailabilities: DateAvailability[];
  let blockedDates: BlockedDate[];
  let bookings: Booking[];
  let settingsArray: BookingSettings[];

  try {
    rules = await prisma.availabilityRule.findMany();
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch availability rules",
      "SLOTS_RULES_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if AvailabilityRule table exists` : "Database query failed"
    );
  }

  try {
    const dateStart = startOfDay(startTime);
    dateAvailabilities = await prisma.dateAvailability.findMany({
      where: {
        date: dateStart,
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    if (prismaCode === "P2021") {
      dateAvailabilities = [];
    } else {
      throw new AvailabilityError(
        "Failed to fetch date availabilities",
        "SLOTS_DATE_AVAIL_FAILED",
        prismaCode,
        prismaCode ? `Prisma error ${prismaCode} - run 'prisma db push' to sync schema` : "Database query failed"
      );
    }
  }

  try {
    blockedDates = await prisma.blockedDate.findMany({
      where: {
        date: startOfDay(startTime),
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch blocked dates",
      "SLOTS_BLOCKED_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if BlockedDate table exists` : "Database query failed"
    );
  }

  try {
    bookings = await prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              { status: "confirmed" },
              { status: "pending" },
            ],
          },
          {
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
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    throw new AvailabilityError(
      "Failed to fetch bookings",
      "SLOTS_BOOKINGS_FAILED",
      prismaCode,
      prismaCode ? `Prisma error ${prismaCode} - check if Booking table exists and has required columns` : "Database query failed"
    );
  }

  try {
    settingsArray = await prisma.bookingSettings.findMany();
  } catch (error) {
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    
    // If BookingSettings table is missing (P2021), fall back to defaults with a warning
    if (prismaCode === "P2021") {
      console.warn("[SLOTS_SETTINGS_MISSING_FALLBACK] BookingSettings table not found, using defaults", {
        code: "SLOTS_SETTINGS_MISSING_FALLBACK",
        prismaCode,
        defaults: { slotLengthMin: 60, bufferMin: 15, minLeadTimeHrs: 24 },
        dbHost: getDatabaseHost(),
      });
      settingsArray = [];
    } else {
      // Other database errors are still hard failures
      throw new AvailabilityError(
        "Failed to fetch booking settings",
        "SLOTS_SETTINGS_FAILED",
        prismaCode,
        prismaCode ? `Prisma error ${prismaCode} - unexpected database error` : "Database query failed"
      );
    }
  }

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

  const minStartTime = new Date(Date.now() + settings.minLeadTimeHrs * 60 * 60 * 1000);
  if (startTime < minStartTime) {
    return false;
  }

  if (isDateBlocked(startTime, blockedDates)) {
    return false;
  }

  if (overlapsWithBooking(startTime, endTime, bookings)) {
    return false;
  }

  const timezone = dateAvailabilities[0]?.timezone || rules[0]?.timezone || "America/New_York";
  
  if (dateAvailabilities.length > 0) {
    const startTimeStr = format(toZonedTime(startTime, timezone), "HH:mm", { timeZone: timezone });
    const endTimeStr = format(toZonedTime(endTime, timezone), "HH:mm", { timeZone: timezone });
    
    const startMinutes = parseTime(startTimeStr);
    const endMinutes = parseTime(endTimeStr);

    return dateAvailabilities.some((avail) => {
      const availStart = parseTime(avail.startTime);
      const availEnd = parseTime(avail.endTime);
      return startMinutes >= availStart && endMinutes <= availEnd;
    });
  }

  const weekday = getWeekdayInTimezone(startTime, timezone);
  const dayRules = rules.filter((r) => r.weekday === weekday);

  if (dayRules.length === 0) {
    return false;
  }

  const startTimeStr = format(toZonedTime(startTime, timezone), "HH:mm", { timeZone: timezone });
  const endTimeStr = format(toZonedTime(endTime, timezone), "HH:mm", { timeZone: timezone });

  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);

  return dayRules.some((rule) => {
    const ruleStart = parseTime(rule.startTime);
    const ruleEnd = parseTime(rule.endTime);
    return startMinutes >= ruleStart && endMinutes <= ruleEnd;
  });
}
