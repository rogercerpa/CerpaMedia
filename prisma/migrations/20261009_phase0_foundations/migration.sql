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
