const EASTERN_TIMESTAMP: Intl.DateTimeFormatOptions = {
  timeZone: "America/New_York",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

export function formatEasternTimestamp(date: Date): string {
  return date.toLocaleString("en-US", EASTERN_TIMESTAMP);
}

export function oneLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
}

export function firstNameFrom(name: string): string {
  const first = oneLine(name).split(" ")[0];
  return first || "there";
}

export function previewText(value: string, max = 90): string {
  const clean = oneLine(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3)}...`;
}

export function displayValue(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const cleaned = oneLine(value);
  return cleaned || fallback;
}

export function multiline(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.replace(/\r\n/g, "\n").trim();
  return trimmed || fallback;
}

const SAFE_EMAIL = /^[A-Za-z0-9._+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function mailtoHref(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length > 254 || !SAFE_EMAIL.test(trimmed)) return null;
  return `mailto:${trimmed}`;
}

export function safeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function intakeLines(answers: unknown): { label: string; value: string }[] {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return [];

  const lines: { label: string; value: string }[] = [];
  for (const [key, value] of Object.entries(answers as Record<string, unknown>)) {
    if (!value) continue;
    const rendered = typeof value === "string" ? value.trim() : oneLine(String(value));
    if (!rendered) continue;
    lines.push({
      label: oneLine(key.replace(/_/g, " ")),
      value: rendered,
    });
  }
  return lines;
}
