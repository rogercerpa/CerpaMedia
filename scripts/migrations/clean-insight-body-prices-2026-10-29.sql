-- Migration: Remove CerpaMedia offer prices from seven Insights article bodies
-- Date: 2026-10-29
-- Idempotent: Yes. replace() is a no-op once the old phrase is gone, and
-- updatedAt changes only when the body actually changes.
--
-- Does not touch vendor prices (for example Muse "$20/$100").
-- Does not change titles, summaries, or any other slug.
--
-- DO NOT run this against production until you have a Neon backup branch.
-- Recommended steps:
-- 1. Create a Neon backup branch from production
-- 2. Run this file on that branch
-- 3. Confirm the second SELECT returns no rows
-- 4. Run this file on production
-- 5. Re-run the SELECT and confirm it still returns no rows

-- Before: offer-price hits in the seven bodies. Expect rows on the first run.
SELECT slug,
       (regexp_matches(body, '.{0,48}(?:\$99|\$799).{0,48}', 'g'))[1] AS offer_price_context
FROM "InsightPost"
WHERE slug IN (
  'php2shell-php-security-update-business-websites',
  'openai-agentic-shift-sbdc-report',
  'dots-vs-grok-bot-vs-muse-ai-teammate',
  'grok-team-bots-shared-ai-coworkers',
  'meta-muse-business-tools',
  'openai-dots-always-on-agents',
  'business-ai-adoption-october-2026'
)
  AND body ~ '\$99|\$799'
ORDER BY slug;

-- Exact phrase replacements only. Longer phrases run first.
UPDATE "InsightPost" AS post
SET
  body = cleaned.body,
  "updatedAt" = NOW()
FROM (
  SELECT
    id,
    replace(
      replace(
        replace(
          replace(
            replace(
              body,
              'book a $99 Technology Strategy Call',
              'book a call'
            ),
            'Technology Strategy Call ($99)',
            'Technology Strategy Call'
          ),
          'Strategy Call ($99)',
          'Strategy Call'
        ),
        '$99 Strategy Call',
        'strategy call'
      ),
      'Founding rate is $799 for the first clients.',
      'Current founding details are on the [AI Teammate Launch](/services/ai-teammate-launch) page.'
    ) AS body
  FROM "InsightPost"
  WHERE slug IN (
    'php2shell-php-security-update-business-websites',
    'openai-agentic-shift-sbdc-report',
    'dots-vs-grok-bot-vs-muse-ai-teammate',
    'grok-team-bots-shared-ai-coworkers',
    'meta-muse-business-tools',
    'openai-dots-always-on-agents',
    'business-ai-adoption-october-2026'
  )
) AS cleaned
WHERE post.id = cleaned.id
  AND post.body IS DISTINCT FROM cleaned.body;

-- After: remaining $99 or $799 in those bodies. Expect zero rows.
SELECT slug,
       (regexp_matches(body, '.{0,48}(?:\$99|\$799).{0,48}', 'g'))[1] AS offer_price_context
FROM "InsightPost"
WHERE slug IN (
  'php2shell-php-security-update-business-websites',
  'openai-agentic-shift-sbdc-report',
  'dots-vs-grok-bot-vs-muse-ai-teammate',
  'grok-team-bots-shared-ai-coworkers',
  'meta-muse-business-tools',
  'openai-dots-always-on-agents',
  'business-ai-adoption-october-2026'
)
  AND body ~ '\$99|\$799'
ORDER BY slug;
