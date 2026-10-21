export function isUniqueConflict(error: unknown): boolean {
  return errorCode(error) === "P2002";
}

export function isMissingRelationError(error: unknown): boolean {
  const code = errorCode(error);
  if (code === "P2021" || code === "P2022") return true;
  const message = error instanceof Error ? error.message : String(error);
  return /does not exist/i.test(message) || /P2021|P2022/.test(message);
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}
