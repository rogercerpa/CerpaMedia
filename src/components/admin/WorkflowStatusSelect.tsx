"use client";

import type { AdminRole } from "@/lib/roles";
import { statusesForRole, statusLabel, type PublishStatus } from "@/lib/publishing";

export default function WorkflowStatusSelect({
  value,
  onChange,
  role,
  blockedReason,
}: {
  value: PublishStatus;
  onChange: (status: PublishStatus) => void;
  role: AdminRole;
  blockedReason?: string | null;
}) {
  const allowed = statusesForRole(role);
  return (
    <div>
      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
        Status *
      </label>
      <select
        id="status"
        value={value}
        onChange={(e) => onChange(e.target.value as PublishStatus)}
        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      >
        {allowed.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
      {role !== "owner" ? (
        <p className="mt-1 text-xs text-gray-500">
          Only Roger (owner) can approve or publish. That rule is enforced on the server, not just hidden here.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500">
          Draft → In review → Approved → Published. Public pages show Published only.
        </p>
      )}
      {blockedReason ? (
        <p className="mt-2 text-sm text-red-700">{blockedReason}</p>
      ) : null}
    </div>
  );
}
