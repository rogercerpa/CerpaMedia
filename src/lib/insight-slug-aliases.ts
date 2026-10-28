/**
 * Insight slug aliases: old slug → new slug mapping
 * 
 * Used to provide zero-downtime slug updates:
 * - Redirects (next.config.ts) use this map
 * - Insights page falls back to old slug when new slug not found
 * - presentInsight matches plans by either new slug or old alias
 * 
 * During transition (after code deploy, before DB update):
 * - Old URLs → 308 redirect to new slugs
 * - New slugs → fetch via old slug fallback → serve correctly
 * - Canonical always uses new slug
 * 
 * After DB update:
 * - Old URLs → 308 redirect to new slugs
 * - New slugs → fetch directly from DB
 * - Fallback no longer needed but remains harmless
 */
export const INSIGHT_SLUG_ALIASES: Record<string, string> = {
  "openai-gpt-4o-gpt-4-1-api-shutdown-small-business": "openai-gpt-4o-gpt-4-1-api-shutdown",
  "small-business-ai-adoption-october-2026": "business-ai-adoption-october-2026",
  "dots-vs-grok-bot-vs-muse-smb-ai-teammate": "dots-vs-grok-bot-vs-muse-ai-teammate",
  "openai-smb-agentic-shift-sbdc-report": "openai-agentic-shift-sbdc-report",
  "openai-dots-always-on-agents-smb": "openai-dots-always-on-agents",
  "meta-muse-small-business-tools": "meta-muse-business-tools",
  "grok-team-bots-shared-ai-coworkers-smb": "grok-team-bots-shared-ai-coworkers",
};

/**
 * Get the old slug for a new slug, if one exists.
 * Returns undefined if no alias exists.
 */
export function getOldSlug(newSlug: string): string | undefined {
  const entry = Object.entries(INSIGHT_SLUG_ALIASES).find(([, newS]) => newS === newSlug);
  return entry?.[0];
}

/**
 * Get the canonical (new) slug for any slug.
 * If the input is an old slug, returns the new one.
 * Otherwise returns the input unchanged.
 */
export function getCanonicalSlug(slug: string): string {
  return INSIGHT_SLUG_ALIASES[slug] ?? slug;
}
