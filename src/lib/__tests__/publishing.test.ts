import { describe, expect, it } from "vitest";
import {
  assertPublishAllowed,
  canSetStatus,
  statusesForRole,
} from "@/lib/publishing";

describe("server-side publish guard", () => {
  it("lets an editor draft and submit for review", () => {
    expect(canSetStatus("editor", "draft")).toBe(true);
    expect(canSetStatus("editor", "in_review")).toBe(true);
    expect(statusesForRole("editor")).toEqual(["draft", "in_review"]);
  });

  it("blocks an editor from publishing even if the UI sent published", () => {
    const result = assertPublishAllowed({
      role: "editor",
      nextStatus: "published",
      linkedSources: [{ status: "verified" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toMatch(/only the owner can publish/i);
    }
  });

  it("blocks an editor from approving", () => {
    const result = assertPublishAllowed({
      role: "editor",
      nextStatus: "approved",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it("lets the owner publish when every linked source is verified", () => {
    const result = assertPublishAllowed({
      role: "owner",
      nextStatus: "published",
      linkedSources: [{ status: "verified" }, { status: "verified" }],
    });
    expect(result).toEqual({ ok: true });
  });

  it("blocks publish when any linked source is still to-verify", () => {
    const result = assertPublishAllowed({
      role: "owner",
      nextStatus: "published",
      linkedSources: [{ status: "verified" }, { status: "to_verify" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toMatch(/to-verify/i);
    }
  });
});
