-- Migration: Update Insights article slugs to remove 'small-business' and 'smb' framing
-- Date: 2026-10-28
-- Idempotent: Yes (uses WHERE clauses to only update if old slug exists)
--
-- IMPORTANT: Run this AFTER the code changes are deployed and redirects are live.
-- The redirects in next.config.ts will handle old URLs before and after this migration.
--
-- Recommended steps:
-- 1. Create a Neon backup branch before running
-- 2. Deploy the code with redirects
-- 3. Run this SQL on the backup branch and verify
-- 4. Run on production
-- 5. Verify old URLs redirect properly (308/301)

-- Update slug: openai-gpt-4o-gpt-4-1-api-shutdown-small-business → openai-gpt-4o-gpt-4-1-api-shutdown
UPDATE "InsightPost"
SET 
  slug = 'openai-gpt-4o-gpt-4-1-api-shutdown',
  "updatedAt" = NOW()
WHERE slug = 'openai-gpt-4o-gpt-4-1-api-shutdown-small-business';

-- Update slug: small-business-ai-adoption-october-2026 → business-ai-adoption-october-2026
UPDATE "InsightPost"
SET 
  slug = 'business-ai-adoption-october-2026',
  "updatedAt" = NOW()
WHERE slug = 'small-business-ai-adoption-october-2026';

-- Update slug: dots-vs-grok-bot-vs-muse-smb-ai-teammate → dots-vs-grok-bot-vs-muse-ai-teammate
UPDATE "InsightPost"
SET 
  slug = 'dots-vs-grok-bot-vs-muse-ai-teammate',
  "updatedAt" = NOW()
WHERE slug = 'dots-vs-grok-bot-vs-muse-smb-ai-teammate';

-- Update slug: openai-smb-agentic-shift-sbdc-report → openai-agentic-shift-sbdc-report
UPDATE "InsightPost"
SET 
  slug = 'openai-agentic-shift-sbdc-report',
  "updatedAt" = NOW()
WHERE slug = 'openai-smb-agentic-shift-sbdc-report';

-- Update slug: openai-dots-always-on-agents-smb → openai-dots-always-on-agents
UPDATE "InsightPost"
SET 
  slug = 'openai-dots-always-on-agents',
  "updatedAt" = NOW()
WHERE slug = 'openai-dots-always-on-agents-smb';

-- Update slug: meta-muse-small-business-tools → meta-muse-business-tools
UPDATE "InsightPost"
SET 
  slug = 'meta-muse-business-tools',
  "updatedAt" = NOW()
WHERE slug = 'meta-muse-small-business-tools';

-- Update slug: grok-team-bots-shared-ai-coworkers-smb → grok-team-bots-shared-ai-coworkers
UPDATE "InsightPost"
SET 
  slug = 'grok-team-bots-shared-ai-coworkers',
  "updatedAt" = NOW()
WHERE slug = 'grok-team-bots-shared-ai-coworkers-smb';

-- Verification query: Check that all old slugs are gone and new slugs exist
-- Run this after the migration to verify
SELECT 
  slug,
  title,
  status,
  "publishedAt"
FROM "InsightPost"
WHERE slug IN (
  'openai-gpt-4o-gpt-4-1-api-shutdown',
  'business-ai-adoption-october-2026',
  'dots-vs-grok-bot-vs-muse-ai-teammate',
  'openai-agentic-shift-sbdc-report',
  'openai-dots-always-on-agents',
  'meta-muse-business-tools',
  'grok-team-bots-shared-ai-coworkers'
)
ORDER BY slug;

-- This query should return 0 rows (old slugs should be gone)
SELECT slug
FROM "InsightPost"
WHERE slug IN (
  'openai-gpt-4o-gpt-4-1-api-shutdown-small-business',
  'small-business-ai-adoption-october-2026',
  'dots-vs-grok-bot-vs-muse-smb-ai-teammate',
  'openai-smb-agentic-shift-sbdc-report',
  'openai-dots-always-on-agents-smb',
  'meta-muse-small-business-tools',
  'grok-team-bots-shared-ai-coworkers-smb'
);
