/**
 * US Federal and Common Holidays
 * Returns a list of holiday dates for a given year
 */

interface Holiday {
  date: Date;
  name: string;
  federal: boolean;
}

function getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
  const date = new Date(year, month, 1);
  date.setDate(1 + ((dayOfWeek - date.getDay() + 7) % 7) + (n - 1) * 7);
  return date;
}

function getLastDayOfMonth(year: number, month: number, dayOfWeek: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const targetDay = lastDay.getDate() - ((lastDay.getDay() - dayOfWeek + 7) % 7);
  return new Date(year, month, targetDay);
}

export function getUSHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  holidays.push({
    date: new Date(year, 0, 1),
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
    date: new Date(year, 5, 19),
    name: "Juneteenth",
    federal: true,
  });

  holidays.push({
    date: new Date(year, 6, 4),
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
    date: new Date(year, 10, 11),
    name: "Veterans Day",
    federal: true,
  });

  holidays.push({
    date: getNthDayOfMonth(year, 10, 4, 4),
    name: "Thanksgiving",
    federal: true,
  });

  holidays.push({
    date: new Date(year, 11, 25),
    name: "Christmas Day",
    federal: true,
  });

  holidays.push({
    date: new Date(year, 1, 14),
    name: "Valentine's Day",
    federal: false,
  });

  holidays.push({
    date: new Date(year, 9, 31),
    name: "Halloween",
    federal: false,
  });

  holidays.push({
    date: new Date(year, 11, 24),
    name: "Christmas Eve",
    federal: false,
  });

  holidays.push({
    date: new Date(year, 11, 31),
    name: "New Year's Eve",
    federal: false,
  });

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getUSFederalHolidays(year: number): Holiday[] {
  return getUSHolidays(year).filter((h) => h.federal);
}
