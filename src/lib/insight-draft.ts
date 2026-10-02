/**
 * Type definitions and helpers for Insight drafts
 * 
 * This module provides the interface between Consult-Secretary AI and the admin CMS
 * for drafting AI/tech insights with SMB business angles.
 * 
 * Consult-Secretary will:
 * - Research latest AI/tech news
 * - Draft posts with SMB business-use angles
 * - Suggest how CerpaMedia services help
 * - Format as InsightDraft
 * 
 * Roger then:
 * - Reviews draft via admin interface
 * - Edits/refines content
 * - Publishes to /insights
 */

export interface ConsultInsightDraft {
  title: string;
  slugSuggestion: string;
  summary: string;
  bodyMd: string;
  tags: string[];
  businessAngles: string[];
  cerpaMediaFit: string;
  sources: Array<{
    title?: string;
    url: string;
  }>;
}

export type InsightDraft = ConsultInsightDraft;

/**
 * Normalizes and validates an insight draft from Consult-Secretary
 * for consumption by the admin CMS
 */
export function toInsightDraft(input: Partial<ConsultInsightDraft>): InsightDraft {
  return {
    title: input.title || "Untitled Insight",
    slugSuggestion: input.slugSuggestion || generateSlug(input.title || "untitled"),
    summary: input.summary || "",
    bodyMd: input.bodyMd || "",
    tags: input.tags || [],
    businessAngles: input.businessAngles || [],
    cerpaMediaFit: input.cerpaMediaFit || "",
    sources: input.sources || [],
  };
}

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats an insight draft for admin review
 */
export function formatInsightDraftForAdmin(draft: InsightDraft): string {
  let text = `=== Insight Draft ===

Title: ${draft.title}
Slug: ${draft.slugSuggestion}
Tags: ${draft.tags.join(", ") || "(none)"}

Summary:
${draft.summary}

Business Angles:
${draft.businessAngles.map((a) => `  • ${a}`).join("\n") || "  (none)"}

CerpaMedia Fit:
${draft.cerpaMediaFit}

Sources:
${draft.sources.map((s) => `  • ${s.title || s.url}: ${s.url}`).join("\n") || "  (none)"}

---

Body (Markdown):
${draft.bodyMd}
`;

  return text;
}
