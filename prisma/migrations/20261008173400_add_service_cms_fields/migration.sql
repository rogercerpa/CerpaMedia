-- AddServiceCMSFields: Add CMS management fields to Service table
-- All new columns are nullable or have defaults to preserve existing rows

ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "outcome" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "features" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "priceNote" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "badgeText" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add indexes for new fields
CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");
CREATE INDEX IF NOT EXISTS "Service_slug_idx" ON "Service"("slug");
CREATE INDEX IF NOT EXISTS "Service_featured_idx" ON "Service"("featured");
CREATE INDEX IF NOT EXISTS "Service_deletedAt_idx" ON "Service"("deletedAt");
