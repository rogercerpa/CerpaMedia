/**
 * Calendar date utilities for date-only fields (no time component)
 * 
 * Problem: `new Date("2026-10-15")` is parsed as UTC midnight, which becomes
 * Oct 14 when stored/read in America/New_York timezone with Prisma @db.Date.
 * 
 * Solution: Always parse date-only strings at noon UTC to avoid timezone shifts.
 */

/**
 * Parse a YYYY-MM-DD string as a calendar date (no timezone shift)
 * Returns a Date at noon UTC for the given calendar day
 * 
 * @param dateString - Format: "YYYY-MM-DD"
 * @returns Date object at noon UTC for the calendar day
 */
export function parseCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  
  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }

  // Create date at noon UTC to avoid timezone shift issues
  // Month is 0-indexed in Date.UTC
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/**
 * Format a Date object as YYYY-MM-DD in its UTC calendar day
 * Use this for API responses and UI display of date-only fields
 * 
 * @param date - Date object
 * @returns String in format "YYYY-MM-DD"
 */
export function formatCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parse multiple date strings safely
 * @param dateStrings - Array of YYYY-MM-DD strings
 * @returns Array of Date objects at noon UTC
 */
export function parseCalendarDates(dateStrings: string[]): Date[] {
  return dateStrings.map(parseCalendarDate);
}
