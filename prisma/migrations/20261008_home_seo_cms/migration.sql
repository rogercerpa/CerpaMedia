-- Add site content, FAQ, testimonials, and SEO meta tables
-- All changes are additive only (new tables)
-- Safe to apply to production via Neon SQL editor

-- Site content for editable sections (hero, how-it-works, etc.)
CREATE TABLE IF NOT EXISTS "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_key_key" ON "SiteContent"("key");
CREATE INDEX IF NOT EXISTS "SiteContent_key_idx" ON "SiteContent"("key");

-- FAQ items
CREATE TABLE IF NOT EXISTS "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FaqItem_published_sortOrder_idx" ON "FaqItem"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "FaqItem_deletedAt_idx" ON "FaqItem"("deletedAt");

-- Testimonials
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Testimonial_published_sortOrder_idx" ON "Testimonial"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Testimonial_deletedAt_idx" ON "Testimonial"("deletedAt");

-- SEO metadata per page
CREATE TABLE IF NOT EXISTS "SeoMeta" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SeoMeta_path_key" ON "SeoMeta"("path");
CREATE INDEX IF NOT EXISTS "SeoMeta_path_idx" ON "SeoMeta"("path");
