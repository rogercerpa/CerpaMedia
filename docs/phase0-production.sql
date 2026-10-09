-- CerpaMedia Phase 0 foundations
-- Paste into Neon SQL editor. Additive only. Safe to run more than once.
-- No DROP / DELETE / TRUNCATE / UPDATE of existing tables.

BEGIN;

-- Phase 0 foundations: additive tables, enums, and indexes only.

DO $$ BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('owner', 'editor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PublishStatus" AS ENUM ('draft', 'in_review', 'approved', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SourceStatus" AS ENUM ('to_verify', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "foundationsUiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "demosPublicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "demoKillSwitch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publishedDate" TEXT,
    "url" TEXT NOT NULL,
    "exactClaim" TEXT,
    "notes" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'to_verify',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Source_status_idx" ON "Source"("status");

-- Guarded default for the singleton settings row (no-op if already set)
ALTER TABLE "SiteSetting" ALTER COLUMN "id" SET DEFAULT 'default';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "demosPublicEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "SourceLink" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourceLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SourceLink_sourceId_targetType_targetId_key" ON "SourceLink"("sourceId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "SourceLink_targetType_targetId_idx" ON "SourceLink"("targetType", "targetId");

CREATE TABLE IF NOT EXISTS "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'general',
    "summaryBox" TEXT NOT NULL,
    "rogerNote" TEXT,
    "rogerStory" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "reviewStamp" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX IF NOT EXISTS "Guide_status_idx" ON "Guide"("status");
CREATE INDEX IF NOT EXISTS "Guide_industry_idx" ON "Guide"("industry");

CREATE TABLE IF NOT EXISTS "GuideSection" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "todaySteps" TEXT NOT NULL,
    "tryItDemoSlug" TEXT,
    "whatStaysHuman" TEXT NOT NULL,
    "todayText" TEXT NOT NULL,
    "years2to5Text" TEXT NOT NULL,
    "years5to10Text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideSection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuideSection_guideId_sortOrder_idx" ON "GuideSection"("guideId", "sortOrder");

CREATE TABLE IF NOT EXISTS "TimelineEntry" (
    "id" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'general',
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TimelineEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TimelineEntry_status_idx" ON "TimelineEntry"("status");
CREATE INDEX IF NOT EXISTS "TimelineEntry_timeframe_industry_idx" ON "TimelineEntry"("timeframe", "industry");

CREATE TABLE IF NOT EXISTS "Demo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "replayScript" JSONB NOT NULL,
    "restingMessage" TEXT NOT NULL DEFAULT 'This demo is paused. Showing the recorded replay.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Demo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Demo_slug_key" ON "Demo"("slug");
CREATE INDEX IF NOT EXISTS "Demo_enabled_idx" ON "Demo"("enabled");
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "status" "PublishStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Demo_status_idx" ON "Demo"("status");

CREATE TABLE IF NOT EXISTS "DemoSample" (
    "id" TEXT NOT NULL,
    "demoId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "cachedOutput" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DemoSample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DemoSample_demoId_sortOrder_idx" ON "DemoSample"("demoId", "sortOrder");

CREATE TABLE IF NOT EXISTS "AnalyticsDailyCount" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsDailyCount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsDailyCount_date_eventName_key" ON "AnalyticsDailyCount"("date", "eventName");

DO $$ BEGIN
  ALTER TABLE "SourceLink" ADD CONSTRAINT "SourceLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "GuideSection" ADD CONSTRAINT "GuideSection_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "DemoSample" ADD CONSTRAINT "DemoSample_demoId_fkey" FOREIGN KEY ("demoId") REFERENCES "Demo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "AdminUser" ("id", "email", "role", "createdAt", "updatedAt")
VALUES ('owner-cerpamedia', 'cerpamedia@gmail.com', 'owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "SiteSetting" (
  "id", "foundationsUiEnabled", "analyticsEnabled", "demosPublicEnabled", "demoKillSwitch",
  "createdAt", "updatedAt"
) VALUES (
  'default', false, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Source" ("id", "title", "publisher", "publishedDate", "url", "notes", "status", "createdAt", "updatedAt")
VALUES
('src-mckinsey-2023', 'The economic potential of generative AI: The next productivity frontier', 'McKinsey Global Institute', 'June 2023', 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-wef-2025', 'Future of Jobs Report 2025', 'World Economic Forum', 'January 2025', 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-stanford-2025', 'AI Index Report 2025', 'Stanford HAI', '2025', 'https://hai.stanford.edu/ai-index', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-nber-31161', 'Generative AI at Work (NBER Working Paper 31161)', 'Brynjolfsson, Li & Raymond', '2023', 'https://www.nber.org/papers/w31161', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-noy-zhang-2023', 'Experimental evidence on the productivity effects of generative artificial intelligence', 'Science', '2023', 'https://www.science.org/doi/10.1126/science.adh2586', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-hbs-24-013', 'Navigating the Jagged Technological Frontier (HBS Working Paper 24-013)', 'Dell''Acqua et al. / Harvard Business School', '2023', 'https://www.hbs.edu/faculty/Pages/item.aspx?num=64700', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-metr-2025', 'Measuring AI Ability to Complete Long Tasks', 'METR', 'March 2025', 'https://metr.org/', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-gartner-agentic', 'Gartner press releases on agentic AI', 'Gartner', '2024-2025', 'https://www.gartner.com/en/newsroom', 'TO VERIFY exact quotes before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-machine-customers', 'When Machines Become Customers', 'Scheibenreif & Raskino / Gartner', '2023', 'https://www.gartner.com/', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-ifr-2025', 'World Robotics 2025', 'International Federation of Robotics', '2025', 'https://ifr.org/worldrobotics', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-census-btos', 'Business Trends and Outlook Survey (BTOS), AI-use questions', 'U.S. Census Bureau', 'latest', 'https://www.census.gov/programs-surveys/btos.html', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-uschamber-2024', 'Empowering Small Business tech report', 'U.S. Chamber of Commerce', '2024', 'https://www.uschamber.com/', 'TO VERIFY edition and claims.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-hbr-leads-2011', 'The Short Life of Online Sales Leads', 'Oldroyd, McElheran & Elkington / Harvard Business Review', 'March 2011', 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-salesforce-customer', 'State of the Connected Customer', 'Salesforce', 'latest', 'https://www.salesforce.com/resources/research-reports/state-of-the-connected-customer/', 'TO VERIFY latest edition.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-anthropic-index', 'Anthropic Economic Index', 'Anthropic', '2025', 'https://www.anthropic.com/research', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('src-bls-ooh', 'Occupational Outlook Handbook (electricians, plumbers, HVAC)', 'U.S. BLS', 'latest', 'https://www.bls.gov/ooh/', 'TO VERIFY before any public claim.', 'to_verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Guide" (
  "id", "title", "slug", "industry", "summaryBox", "rogerNote", "reviewStamp", "status", "createdAt", "updatedAt"
) VALUES (
  'guide-run-on-ai',
  'How any small business runs on AI',
  'run-on-ai',
  'general',
  'A 2-minute map of the business track: get found, reply, quote, schedule, do the work, invoice, follow up. AI drafts. You approve.',
  'I will not publish a number we did not find in a source. This draft is here so we can review the skeleton, not the public site.',
  'Not yet reviewed for live.',
  'draft',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "GuideSection" (
  "id", "guideId", "sortOrder", "title", "job", "todaySteps", "tryItDemoSlug", "whatStaysHuman", "todayText", "years2to5Text", "years5to10Text", "createdAt", "updatedAt"
) VALUES (
  'guide-run-on-ai-s0',
  'guide-run-on-ai',
  0,
  'Start here: the business track',
  'See the week as six repeating jobs, not a pile of tools.',
  'Write down how a lead becomes cash in your business today.',
  'inbox-rescue',
  'You still decide what good looks like.',
  'AI drafts. The owner approves.',
  'Agents run whole workflows inside your rules.',
  'Customers buy through their own agents. Craft and trust stay human.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "TimelineEntry" ("id", "timeframe", "industry", "title", "text", "status", "createdAt", "updatedAt")
VALUES
('tl-today', 'today', 'general', 'AI drafts, the owner approves', 'Useful now for email, quotes, scheduling, and notes. A human still sends it.', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tl-2-5', '2-5', 'general', 'Agents run whole workflows', 'Small teams operate like bigger ones. Customers expect fast replies. This is an informed view, not a guarantee.', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tl-5-10', '5-10', 'general', 'The human edge is trust and craft', 'Robotics and automation are common in physical work. Customers buy through their own AI agents. Relationships stay the moat.', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SourceLink" ("id", "sourceId", "targetType", "targetId", "createdAt")
VALUES
('sl-guide-mckinsey', 'src-mckinsey-2023', 'guide', 'guide-run-on-ai', CURRENT_TIMESTAMP),
('sl-tl-today-hbr', 'src-hbr-leads-2011', 'timeline', 'tl-today', CURRENT_TIMESTAMP)
ON CONFLICT ("sourceId", "targetType", "targetId") DO NOTHING;

INSERT INTO "Demo" (
  "id", "slug", "title", "description", "enabled", "status", "replayScript", "restingMessage", "createdAt", "updatedAt"
) VALUES (
  'demo-inbox-rescue',
  'inbox-rescue',
  'Inbox Rescue',
  'Watch a customer email turn into a calm draft reply. Recorded replay first. Pick a sample to see a pre-written output. No free-text box.',
  true,
  'draft',
  '{"inputLabel":"Customer email","outputLabel":"Draft reply","before":"Hi — I called twice yesterday about the leak under the kitchen sink. Nobody called back. If I don''t hear from you today I''m calling someone else.","after":"Hi — sorry you had to wait. I have you flagged for a same-day look this afternoon. I''ll confirm the window as soon as we lock the route. If the leak is active, shut the valve under the sink and text is not needed — email or call is enough.","durationMs":4200}'::jsonb,
  'This demo is paused. Showing the recorded replay.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "DemoSample" (
  "id", "demoId", "label", "inputText", "cachedOutput", "sortOrder", "createdAt", "updatedAt"
) VALUES
(
  'sample-angry',
  'demo-inbox-rescue',
  'Angry customer',
  'This is the third time the job ran long and nobody told me. Do not send a cheerful template.',
  'You are right to be frustrated. The job ran long and we did not update you. I own that. Here is the next step: I will call you before 10am with a firm window, and I will not mark it done until you say the site is as agreed.',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sample-quote',
  'demo-inbox-rescue',
  'Quote request',
  'Can you quote replacing two bathroom exhaust fans this week? Second floor, 1998 house.',
  'Thanks for the details. I can look at two bathroom exhaust fans on a 1998 second floor this week. I will walk the site, then send a line-item quote with [your price] blanks filled in after I see access and wiring. I will not invent a number in this email.',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sample-reschedule',
  'demo-inbox-rescue',
  'Reschedule',
  'Need to move Thursday 2pm. Earliest I can do is Friday morning.',
  'Got it — Thursday 2pm is released. I have Friday morning held on the board and will send the confirmed window once the route is set. If Friday morning fills, I will email you the next open slot instead of leaving you hanging.',
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sample-after-hours',
  'demo-inbox-rescue',
  'After hours',
  'It is 9:40pm. The breaker keeps tripping when the AC kicks on. Are you open?',
  'We are closed for new visits tonight. If you smell burning or see sparks, stay clear and call emergency services. Otherwise flip the AC breaker off until morning. I will have this at the top of the board when we open and will email the first window we can take.',
  3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

COMMIT;

-- Closing checks: expected vs actual, with ok column
SELECT * FROM (
  SELECT 'AdminUser owner'::text AS object, 1 AS expected, COUNT(*)::int AS actual, (COUNT(*) = 1) AS ok
  FROM "AdminUser" WHERE email = 'cerpamedia@gmail.com' AND role = 'owner'
  UNION ALL
  SELECT 'SiteSetting default', 1, COUNT(*)::int, (COUNT(*) = 1)
  FROM "SiteSetting" WHERE id = 'default' AND "foundationsUiEnabled" = false AND "analyticsEnabled" = false AND "demosPublicEnabled" = false AND "demoKillSwitch" = false
  UNION ALL
  SELECT 'Source library', 16, COUNT(*)::int, (COUNT(*) = 16)
  FROM "Source"
  UNION ALL
  SELECT 'Sources to-verify', 16, COUNT(*)::int, (COUNT(*) = 16)
  FROM "Source" WHERE status = 'to_verify'
  UNION ALL
  SELECT 'Guide draft', 1, COUNT(*)::int, (COUNT(*) = 1)
  FROM "Guide" WHERE slug = 'run-on-ai' AND status = 'draft'
  UNION ALL
  SELECT 'Guide sections', 1, COUNT(*)::int, (COUNT(*) >= 1)
  FROM "GuideSection" WHERE "guideId" = 'guide-run-on-ai'
  UNION ALL
  SELECT 'Timeline drafts', 3, COUNT(*)::int, (COUNT(*) = 3)
  FROM "TimelineEntry" WHERE status = 'draft'
  UNION ALL
  SELECT 'Inbox Rescue demo', 1, COUNT(*)::int, (COUNT(*) = 1)
  FROM "Demo" WHERE slug = 'inbox-rescue' AND status = 'draft' AND enabled = true
  UNION ALL
  SELECT 'Demos public flag off', 1, COUNT(*)::int, (COUNT(*) = 1)
  FROM "SiteSetting" WHERE id = 'default' AND "demosPublicEnabled" = false
  UNION ALL
  SELECT 'Demo samples', 4, COUNT(*)::int, (COUNT(*) = 4)
  FROM "DemoSample" WHERE "demoId" = 'demo-inbox-rescue'
  UNION ALL
  SELECT 'Phase0 tables present', 10, COUNT(*)::int, (COUNT(*) = 10)
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'AdminUser','SiteSetting','Source','SourceLink','Guide','GuideSection',
      'TimelineEntry','Demo','DemoSample','AnalyticsDailyCount'
    )
  UNION ALL
  SELECT 'No usage table', 0, COUNT(*)::int, (COUNT(*) = 0)
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'DemoUsageDay'
) checks
ORDER BY object;
