const EASTERN = "America/New_York";

export function addEasternBusinessDays(start: Date, businessDays: number): Date {
  if (!Number.isInteger(businessDays) || businessDays < 0) {
    throw new Error("businessDays must be a non-negative integer");
  }

  const initial = easternParts(start);
  let year = initial.year;
  let month = initial.month;
  let day = initial.day;
  let remaining = businessDays;

  while (remaining > 0) {
    const next = nextCivilDay(year, month, day);
    year = next.year;
    month = next.month;
    day = next.day;
    const noon = easternToUtc(year, month, day, 12, 0, 0);
    const weekday = easternParts(noon).weekday;
    if (weekday !== "Sat" && weekday !== "Sun") remaining -= 1;
  }

  return easternToUtc(year, month, day, initial.hour, initial.minute, initial.second);
}

/** True once 2 Eastern business days have passed since the purchase. */
export function isLaunchReminderDue(createdAt: Date, now: Date): boolean {
  return now.getTime() >= addEasternBusinessDays(createdAt, 2).getTime();
}

export function purchasesNeedingReminder<T extends {
  createdAt: Date;
  bookingId: string | null;
  welcomeReminderSentAt: Date | null;
  buyerEmail: string | null;
}>(rows: T[], now: Date): T[] {
  return rows.filter(
    (row) =>
      Boolean(row.buyerEmail) &&
      !row.bookingId &&
      !row.welcomeReminderSentAt &&
      isLaunchReminderDue(row.createdAt, now)
  );
}

function easternParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
    second: Number(bag.second),
    weekday: bag.weekday,
  };
}

function nextCivilDay(year: number, month: number, day: number) {
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + 1);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function easternToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = tzOffsetMs(guess);
  const utc = new Date(guess.getTime() - offset);
  const corrected = tzOffsetMs(utc);
  if (corrected !== offset) return new Date(guess.getTime() - corrected);
  return utc;
}

function tzOffsetMs(date: Date): number {
  const parts = easternParts(date);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return asUtc - date.getTime();
}
