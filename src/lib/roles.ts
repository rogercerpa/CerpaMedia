export type AdminRole = "owner" | "editor";

export const OWNER_EMAIL = (
  process.env.ADMIN_EMAIL || "cerpamedia@gmail.com"
).toLowerCase();

export function resolveRole(
  email: string,
  dbRole?: string | null
): AdminRole {
  if (email.toLowerCase() === OWNER_EMAIL) {
    return "owner";
  }
  if (dbRole === "owner") {
    return "owner";
  }
  return "editor";
}

export function isOwnerRole(role: AdminRole): boolean {
  return role === "owner";
}
