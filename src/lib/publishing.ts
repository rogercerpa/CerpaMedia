import type { AdminRole } from "./roles";

export const PUBLISH_STATUSES = [
  "draft",
  "in_review",
  "approved",
  "published",
] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const SOURCE_STATUSES = ["to_verify", "verified", "rejected"] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const SOURCE_STATUS_TO_VERIFY = "to_verify";

export const EDITOR_SETTABLE_STATUSES: readonly PublishStatus[] = [
  "draft",
  "in_review",
];

export const OWNER_SETTABLE_STATUSES: readonly PublishStatus[] = PUBLISH_STATUSES;

export function isPublishStatus(value: string): value is PublishStatus {
  return (PUBLISH_STATUSES as readonly string[]).includes(value);
}

export function statusesForRole(role: AdminRole): readonly PublishStatus[] {
  return role === "owner" ? OWNER_SETTABLE_STATUSES : EDITOR_SETTABLE_STATUSES;
}

export function canSetStatus(role: AdminRole, status: PublishStatus): boolean {
  return statusesForRole(role).includes(status);
}

export type LinkedSource = { status: string };

export type PublishGuardResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

export function assertPublishAllowed(args: {
  role: AdminRole;
  nextStatus: string;
  linkedSources?: LinkedSource[];
}): PublishGuardResult {
  if (!isPublishStatus(args.nextStatus)) {
    return { ok: false, error: "Invalid status.", status: 400 };
  }

  if (!canSetStatus(args.role, args.nextStatus)) {
    if (args.nextStatus === "published") {
      return {
        ok: false,
        error: "Only the owner can publish. Publishing is enforced on the server.",
        status: 403,
      };
    }
    if (args.nextStatus === "approved") {
      return {
        ok: false,
        error: "Only the owner can mark content as approved.",
        status: 403,
      };
    }
    return {
      ok: false,
      error: "You cannot set this publishing status.",
      status: 403,
    };
  }

  if (args.nextStatus === "published") {
    const unverified = (args.linkedSources ?? []).filter(
      (source) => source.status === SOURCE_STATUS_TO_VERIFY
    );
    if (unverified.length > 0) {
      return {
        ok: false,
        error: `Cannot publish while ${unverified.length} linked source${
          unverified.length === 1 ? " is" : "s are"
        } still marked to-verify.`,
        status: 409,
      };
    }
  }

  return { ok: true };
}

export function publishedOnlyWhere() {
  return { status: "published" as const };
}

export function statusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "in_review":
      return "In review";
    case "approved":
      return "Approved";
    case "published":
      return "Published";
    case "to_verify":
      return "To verify";
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}
