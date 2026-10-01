/**
 * US Federal and Common Holidays
 * Returns a list of holiday dates for a given year
 * All dates are at noon UTC to avoid timezone shift issues with @db.Date
 */

interface Holiday {
  date: Date;
  name: string;
  federal: boolean;
}

function getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
  // Use UTC to avoid timezone issues
  const date = new Date(Date.UTC(year, month, 1, 12, 0, 0, 0));
  const firstDay = date.getUTCDay();
  const offset = (dayOfWeek - firstDay + 7) % 7;
  const targetDate = 1 + offset + (n - 1) * 7;
  return new Date(Date.UTC(year, month, targetDate, 12, 0, 0, 0));
}

function getLastDayOfMonth(year: number, month: number, dayOfWeek: number): Date {
  // Get last day of month in UTC
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0, 0));
  const lastDayOfWeek = lastDay.getUTCDay();
  const daysBack = (lastDayOfWeek - dayOfWeek + 7) % 7;
  const targetDate = lastDay.getUTCDate() - daysBack;
  return new Date(Date.UTC(year, month, targetDate, 12, 0, 0, 0));
}

export function getUSHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  holidays.push({
    date: new Date(Date.UTC(year, 0, 1, 12, 0, 0, 0)),
    name: "New Year's Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 0, 1, 3),
    name: "Martin Luther King Jr. Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 1, 1, 3),
    name: "Presidents' Day",
    federal: true,
  });

  holidays.push({
    date: getLastDayOfMonth(year, 4, 1),
    name: "Memorial Day",
    federal: true,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 5, 19, 12, 0, 0, 0)),
    name: "Juneteenth",
    federal: true,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 6, 4, 12, 0, 0, 0)),
    name: "Independence Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 8, 1, 1),
    name: "Labor Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 9, 1, 2),
    name: "Columbus Day",
    federal: true,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 10, 11, 12, 0, 0, 0)),
    name: "Veterans Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 10, 4, 4),
    name: "Thanksgiving",
    federal: true,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 11, 25, 12, 0, 0, 0)),
    name: "Christmas Day",
    federal: true,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 1, 14, 12, 0, 0, 0)),
    name: "Valentine's Day",
    federal: false,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 9, 31, 12, 0, 0, 0)),
    name: "Halloween",
    federal: false,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 11, 24, 12, 0, 0, 0)),
    name: "Christmas Eve",
    federal: false,
  });

  holidays.push({
    date: new Date(Date.UTC(year, 11, 31, 12, 0, 0, 0)),
    name: "New Year's Eve",
    federal: false,
  });

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getUSFederalHolidays(year: number): Holiday[] {
  return getUSHolidays(year).filter((h) => h.federal);
}
