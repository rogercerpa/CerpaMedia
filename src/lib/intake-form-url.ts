/** Google Form (or any https URL) for the Launch intake. Missing means send it by hand. */
export function getIntakeFormUrl(): string | null {
  const raw = process.env.ATL_INTAKE_FORM_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
