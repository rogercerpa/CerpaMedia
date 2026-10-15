-- CerpaMedia PR #37 Phase 0 schema, regenerated against main after #38 and #39.
-- Additive and idempotent. Safe to run more than once.
-- Creates only the tables, columns, indexes, enums, and foreign keys that
-- prisma migrate diff reports from main's schema to this branch.
-- Feature flags are inserted OFF. Existing rows are left unchanged.

BEGIN;

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

ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" "AdminRole" NOT NULL DEFAULT 'editor';
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AdminUser_pkey'
      AND conrelid = '"AdminUser"'::regclass
  ) THEN
    ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "foundationsUiEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "analyticsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "demosPublicEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "demoKillSwitch" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SiteSetting_pkey'
      AND conrelid = '"SiteSetting"'::regclass
  ) THEN
    ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "publisher" TEXT NOT NULL;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "publishedDate" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "url" TEXT NOT NULL;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "exactClaim" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "status" "SourceStatus" NOT NULL DEFAULT 'to_verify';
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "nextReviewAt" TIMESTAMP(3);
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Source_pkey'
      AND conrelid = '"Source"'::regclass
  ) THEN
    ALTER TABLE "Source" ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SourceLink" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourceLink_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SourceLink" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "SourceLink" ADD COLUMN IF NOT EXISTS "sourceId" TEXT NOT NULL;
ALTER TABLE "SourceLink" ADD COLUMN IF NOT EXISTS "targetType" TEXT NOT NULL;
ALTER TABLE "SourceLink" ADD COLUMN IF NOT EXISTS "targetId" TEXT NOT NULL;
ALTER TABLE "SourceLink" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SourceLink_pkey'
      AND conrelid = '"SourceLink"'::regclass
  ) THEN
    ALTER TABLE "SourceLink" ADD CONSTRAINT "SourceLink_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "industry" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "summaryBox" TEXT NOT NULL;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "rogerNote" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "rogerStory" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "reviewStamp" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "status" "PublishStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Guide_pkey'
      AND conrelid = '"Guide"'::regclass
  ) THEN
    ALTER TABLE "Guide" ADD CONSTRAINT "Guide_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "guideId" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "job" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "todaySteps" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "tryItDemoSlug" TEXT;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "whatStaysHuman" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "todayText" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "years2to5Text" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "years5to10Text" TEXT NOT NULL;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "GuideSection" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'GuideSection_pkey'
      AND conrelid = '"GuideSection"'::regclass
  ) THEN
    ALTER TABLE "GuideSection" ADD CONSTRAINT "GuideSection_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "timeframe" TEXT NOT NULL;
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "industry" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL;
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "text" TEXT NOT NULL;
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "status" "PublishStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TimelineEntry" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'TimelineEntry_pkey'
      AND conrelid = '"TimelineEntry"'::regclass
  ) THEN
    ALTER TABLE "TimelineEntry" ADD CONSTRAINT "TimelineEntry_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "status" "PublishStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "replayScript" JSONB NOT NULL;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "restingMessage" TEXT NOT NULL DEFAULT 'This demo is paused. Showing the recorded replay.';
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Demo" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Demo_pkey'
      AND conrelid = '"Demo"'::regclass
  ) THEN
    ALTER TABLE "Demo" ADD CONSTRAINT "Demo_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

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

ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "demoId" TEXT NOT NULL;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "label" TEXT NOT NULL;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "inputText" TEXT NOT NULL;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "cachedOutput" TEXT;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DemoSample" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DemoSample_pkey'
      AND conrelid = '"DemoSample"'::regclass
  ) THEN
    ALTER TABLE "DemoSample" ADD CONSTRAINT "DemoSample_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AnalyticsDailyCount" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsDailyCount_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL;
ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "date" TEXT NOT NULL;
ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "eventName" TEXT NOT NULL;
ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AnalyticsDailyCount" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AnalyticsDailyCount_pkey'
      AND conrelid = '"AnalyticsDailyCount"'::regclass
  ) THEN
    ALTER TABLE "AnalyticsDailyCount" ADD CONSTRAINT "AnalyticsDailyCount_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

ALTER TABLE "SiteSetting" ALTER COLUMN "id" SET DEFAULT 'default';
ALTER TABLE "SiteSetting" ALTER COLUMN "foundationsUiEnabled" SET DEFAULT false;
ALTER TABLE "SiteSetting" ALTER COLUMN "analyticsEnabled" SET DEFAULT false;
ALTER TABLE "SiteSetting" ALTER COLUMN "demosPublicEnabled" SET DEFAULT false;
ALTER TABLE "SiteSetting" ALTER COLUMN "demoKillSwitch" SET DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "Source_status_idx" ON "Source"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "SourceLink_sourceId_targetType_targetId_key" ON "SourceLink"("sourceId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "SourceLink_targetType_targetId_idx" ON "SourceLink"("targetType", "targetId");
CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX IF NOT EXISTS "Guide_status_idx" ON "Guide"("status");
CREATE INDEX IF NOT EXISTS "Guide_industry_idx" ON "Guide"("industry");
CREATE INDEX IF NOT EXISTS "GuideSection_guideId_sortOrder_idx" ON "GuideSection"("guideId", "sortOrder");
CREATE INDEX IF NOT EXISTS "TimelineEntry_status_idx" ON "TimelineEntry"("status");
CREATE INDEX IF NOT EXISTS "TimelineEntry_timeframe_industry_idx" ON "TimelineEntry"("timeframe", "industry");
CREATE UNIQUE INDEX IF NOT EXISTS "Demo_slug_key" ON "Demo"("slug");
CREATE INDEX IF NOT EXISTS "Demo_enabled_idx" ON "Demo"("enabled");
CREATE INDEX IF NOT EXISTS "Demo_status_idx" ON "Demo"("status");
CREATE INDEX IF NOT EXISTS "DemoSample_demoId_sortOrder_idx" ON "DemoSample"("demoId", "sortOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsDailyCount_date_eventName_key" ON "AnalyticsDailyCount"("date", "eventName");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SourceLink_sourceId_fkey'
      AND conrelid = '"SourceLink"'::regclass
  ) THEN
    ALTER TABLE "SourceLink" ADD CONSTRAINT "SourceLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'GuideSection_guideId_fkey'
      AND conrelid = '"GuideSection"'::regclass
  ) THEN
    ALTER TABLE "GuideSection" ADD CONSTRAINT "GuideSection_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DemoSample_demoId_fkey'
      AND conrelid = '"DemoSample"'::regclass
  ) THEN
    ALTER TABLE "DemoSample" ADD CONSTRAINT "DemoSample_demoId_fkey" FOREIGN KEY ("demoId") REFERENCES "Demo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "SiteSetting" (
  "id", "foundationsUiEnabled", "analyticsEnabled", "demosPublicEnabled", "demoKillSwitch",
  "createdAt", "updatedAt"
) VALUES (
  'default', false, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

COMMIT;

-- Each check returns name text and ok boolean.
SELECT name, ok
FROM (
  SELECT 'enum AdminRole'::text AS name, EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'AdminRole'
  ) AS ok
  UNION ALL
  SELECT 'enum PublishStatus'::text AS name, EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'PublishStatus'
  ) AS ok
  UNION ALL
  SELECT 'enum SourceStatus'::text AS name, EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'SourceStatus'
  ) AS ok
  UNION ALL
  SELECT 'table AdminUser'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'AdminUser'
  ) AS ok
  UNION ALL
  SELECT 'column AdminUser.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column AdminUser.email'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'email'
  ) AS ok
  UNION ALL
  SELECT 'column AdminUser.role'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'role'
  ) AS ok
  UNION ALL
  SELECT 'column AdminUser.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column AdminUser.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint AdminUser_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AdminUser_pkey' AND conrelid = '"AdminUser"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table SiteSetting'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'SiteSetting'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.foundationsUiEnabled'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'foundationsUiEnabled'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.analyticsEnabled'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'analyticsEnabled'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.demosPublicEnabled'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'demosPublicEnabled'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.demoKillSwitch'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'demoKillSwitch'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column SiteSetting.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SiteSetting' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint SiteSetting_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SiteSetting_pkey' AND conrelid = '"SiteSetting"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table Source'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Source'
  ) AS ok
  UNION ALL
  SELECT 'column Source.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column Source.title'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'title'
  ) AS ok
  UNION ALL
  SELECT 'column Source.publisher'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'publisher'
  ) AS ok
  UNION ALL
  SELECT 'column Source.publishedDate'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'publishedDate'
  ) AS ok
  UNION ALL
  SELECT 'column Source.url'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'url'
  ) AS ok
  UNION ALL
  SELECT 'column Source.exactClaim'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'exactClaim'
  ) AS ok
  UNION ALL
  SELECT 'column Source.notes'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'notes'
  ) AS ok
  UNION ALL
  SELECT 'column Source.status'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'status'
  ) AS ok
  UNION ALL
  SELECT 'column Source.verifiedBy'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'verifiedBy'
  ) AS ok
  UNION ALL
  SELECT 'column Source.verifiedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'verifiedAt'
  ) AS ok
  UNION ALL
  SELECT 'column Source.nextReviewAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'nextReviewAt'
  ) AS ok
  UNION ALL
  SELECT 'column Source.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column Source.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Source' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint Source_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Source_pkey' AND conrelid = '"Source"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table SourceLink'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'SourceLink'
  ) AS ok
  UNION ALL
  SELECT 'column SourceLink.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SourceLink' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column SourceLink.sourceId'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SourceLink' AND column_name = 'sourceId'
  ) AS ok
  UNION ALL
  SELECT 'column SourceLink.targetType'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SourceLink' AND column_name = 'targetType'
  ) AS ok
  UNION ALL
  SELECT 'column SourceLink.targetId'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SourceLink' AND column_name = 'targetId'
  ) AS ok
  UNION ALL
  SELECT 'column SourceLink.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SourceLink' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint SourceLink_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SourceLink_pkey' AND conrelid = '"SourceLink"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table Guide'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Guide'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.title'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'title'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.slug'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'slug'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.industry'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'industry'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.summaryBox'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'summaryBox'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.rogerNote'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'rogerNote'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.rogerStory'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'rogerStory'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.seoTitle'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'seoTitle'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.seoDescription'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'seoDescription'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.reviewStamp'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'reviewStamp'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.reviewedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'reviewedAt'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.status'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'status'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.publishedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'publishedAt'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column Guide.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Guide' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint Guide_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Guide_pkey' AND conrelid = '"Guide"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table GuideSection'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'GuideSection'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.guideId'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'guideId'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.sortOrder'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'sortOrder'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.title'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'title'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.job'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'job'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.todaySteps'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'todaySteps'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.tryItDemoSlug'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'tryItDemoSlug'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.whatStaysHuman'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'whatStaysHuman'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.todayText'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'todayText'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.years2to5Text'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'years2to5Text'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.years5to10Text'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'years5to10Text'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column GuideSection.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GuideSection' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint GuideSection_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'GuideSection_pkey' AND conrelid = '"GuideSection"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table TimelineEntry'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.timeframe'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'timeframe'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.industry'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'industry'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.title'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'title'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.text'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'text'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.status'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'status'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.publishedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'publishedAt'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column TimelineEntry.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimelineEntry' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint TimelineEntry_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'TimelineEntry_pkey' AND conrelid = '"TimelineEntry"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table Demo'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Demo'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.slug'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'slug'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.title'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'title'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.description'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'description'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.enabled'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'enabled'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.status'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'status'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.publishedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'publishedAt'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.replayScript'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'replayScript'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.restingMessage'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'restingMessage'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column Demo.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Demo' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint Demo_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Demo_pkey' AND conrelid = '"Demo"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table DemoSample'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'DemoSample'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.demoId'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'demoId'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.label'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'label'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.inputText'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'inputText'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.cachedOutput'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'cachedOutput'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.sortOrder'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'sortOrder'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column DemoSample.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DemoSample' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint DemoSample_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DemoSample_pkey' AND conrelid = '"DemoSample"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'table AnalyticsDailyCount'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.id'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'id'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.date'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'date'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.eventName'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'eventName'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.count'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'count'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.createdAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'createdAt'
  ) AS ok
  UNION ALL
  SELECT 'column AnalyticsDailyCount.updatedAt'::text AS name, EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AnalyticsDailyCount' AND column_name = 'updatedAt'
  ) AS ok
  UNION ALL
  SELECT 'constraint AnalyticsDailyCount_pkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AnalyticsDailyCount_pkey' AND conrelid = '"AnalyticsDailyCount"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'index AdminUser_email_key'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'AdminUser_email_key'
  ) AS ok
  UNION ALL
  SELECT 'index Source_status_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Source_status_idx'
  ) AS ok
  UNION ALL
  SELECT 'index SourceLink_sourceId_targetType_targetId_key'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'SourceLink_sourceId_targetType_targetId_key'
  ) AS ok
  UNION ALL
  SELECT 'index SourceLink_targetType_targetId_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'SourceLink_targetType_targetId_idx'
  ) AS ok
  UNION ALL
  SELECT 'index Guide_slug_key'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Guide_slug_key'
  ) AS ok
  UNION ALL
  SELECT 'index Guide_status_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Guide_status_idx'
  ) AS ok
  UNION ALL
  SELECT 'index Guide_industry_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Guide_industry_idx'
  ) AS ok
  UNION ALL
  SELECT 'index GuideSection_guideId_sortOrder_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'GuideSection_guideId_sortOrder_idx'
  ) AS ok
  UNION ALL
  SELECT 'index TimelineEntry_status_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'TimelineEntry_status_idx'
  ) AS ok
  UNION ALL
  SELECT 'index TimelineEntry_timeframe_industry_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'TimelineEntry_timeframe_industry_idx'
  ) AS ok
  UNION ALL
  SELECT 'index Demo_slug_key'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Demo_slug_key'
  ) AS ok
  UNION ALL
  SELECT 'index Demo_enabled_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Demo_enabled_idx'
  ) AS ok
  UNION ALL
  SELECT 'index Demo_status_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Demo_status_idx'
  ) AS ok
  UNION ALL
  SELECT 'index DemoSample_demoId_sortOrder_idx'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'DemoSample_demoId_sortOrder_idx'
  ) AS ok
  UNION ALL
  SELECT 'index AnalyticsDailyCount_date_eventName_key'::text AS name, EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'AnalyticsDailyCount_date_eventName_key'
  ) AS ok
  UNION ALL
  SELECT 'constraint SourceLink_sourceId_fkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SourceLink_sourceId_fkey' AND conrelid = '"SourceLink"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'constraint GuideSection_guideId_fkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'GuideSection_guideId_fkey' AND conrelid = '"GuideSection"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'constraint DemoSample_demoId_fkey'::text AS name, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DemoSample_demoId_fkey' AND conrelid = '"DemoSample"'::regclass
  ) AS ok
  UNION ALL
  SELECT 'SiteSetting flags off'::text AS name, EXISTS (
    SELECT 1 FROM "SiteSetting"
    WHERE id = 'default'
      AND "foundationsUiEnabled" = false
      AND "analyticsEnabled" = false
      AND "demosPublicEnabled" = false
      AND "demoKillSwitch" = false
  ) AS ok
  UNION ALL
  SELECT 'No DemoUsageDay'::text AS name, NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'DemoUsageDay'
  ) AS ok
) checks
ORDER BY name;
