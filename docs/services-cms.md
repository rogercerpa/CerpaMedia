# Services CMS Documentation

## Overview

The Services CMS allows managing service offerings through an admin interface with full CRUD operations, soft delete, reordering, and live preview.

## Schema Changes

### Production Deployment Path

Production (Neon) does NOT use Prisma Migrate. Past schema changes (like DateAvailability) were deployed via `prisma db push`.

**To deploy this schema change to production:**

1. The migration SQL file at `prisma/migrations/20261008173400_add_service_cms_fields/migration.sql` contains additive-only changes with `IF NOT EXISTS` guards
2. Apply it manually via the Neon SQL editor or psql:
   ```sql
   -- All ALTER TABLE statements use IF NOT EXISTS
   -- All CREATE INDEX statements use IF NOT EXISTS
   ```
3. After applying, run the seed to backfill existing services with new fields

**Rollback:**

Since all new columns are nullable or have defaults, rolling back code is safe. The old columns remain and new code simply ignores the new columns.

### Schema Change Details

**New fields added to Service model:**
- `slug` (TEXT, unique, nullable) - URL-friendly identifier
- `outcome` (TEXT, nullable) - Expected outcome description
- `description` (TEXT, nullable) - Full description (vs shortDesc)
- `features` (TEXT[], default []) - List of feature bullets
- `price` (FLOAT, nullable) - Numeric price for sorting/filtering
- `priceNote` (TEXT, nullable) - Additional pricing context
- `badgeText` (TEXT, nullable) - Badge label for featured services
- `featured` (BOOLEAN, default false) - Featured flag
- `seoTitle` (TEXT, nullable) - SEO-optimized title
- `seoDescription` (TEXT, nullable) - SEO meta description
- `deletedAt` (TIMESTAMP, nullable) - Soft delete timestamp

**Indexes added:**
- Unique index on `slug`
- Index on `featured`
- Index on `deletedAt`

## Seed Idempotency

The seed script (`prisma/seed.ts`) is idempotent and safe to run multiple times:

1. Matches existing services by `slug` OR `title`
2. Updates existing rows with new field values
3. Preserves original IDs
4. Only creates new services if they don't exist

**Running the seed:**

```bash
DATABASE_URL=<connection-string> npx tsx prisma/seed.ts
```

**Expected behavior:**
- First run: Updates 8 existing services with new fields, creates 1 new (AI Teammate Launch)
- Second run: No duplicates, all updates idempotent

## Public vs Admin Rendering

### Public Pages (main parity)

The public /services page and home teaser render exactly as on main:
- **Services grid**: Shows title, description, and features list
- **NO prices displayed** per card
- **NO CTAs displayed** per card
- Features array matches main's hardcoded lists exactly

### Admin Pages

Admin can edit all fields including:
- Prices (stored but not shown publicly)
- Outcome (stored but not shown publicly)
- SEO fields
- Featured flag
- Publish/unpublish
- Soft delete

## Feature Lists

Each service has a features array for the "What we offer" section. These match main's hardcoded features:

**Web Development:**
- Custom website design and development
- Responsive design for mobile and desktop
- Content management systems
- E-commerce solutions
- Performance optimization

**Web Applications:**
- Custom business applications
- Database design and integration
- API development and integration
- User authentication and security
- Cloud hosting and deployment

(etc. - see `src/lib/services.ts` fallbackServices for complete list)

## Questions for Roger

1. **Public pricing display:** The CMS stores prices but doesn't show them publicly (matching main). Should this change?
2. **Technology Strategy Call in grid:** Should this appear in the public grid or only in the featured callout?
3. **Home page featured services:** Should the home teaser pull from `featured=true` services or stay hardcoded?

## Phase 2 Options

Rough estimates at $125/hr:

- **Home hero/CTAs optimization** (~4 hrs): Update hero CTAs to dynamically pull from services
- **FAQ section** (~6 hrs): Add FAQ model and admin CRUD
- **Testimonials** (~8 hrs): Add testimonial model, admin CRUD, and public display
- **AI Teammate Launch full page** (~10 hrs): Expand the landing page with more detail sections
- **Insights editor improvements** (~6 hrs): Add image upload, better markdown preview
- **Booking cancel/reschedule** (~12 hrs): Allow customers to cancel or reschedule bookings
- **Site settings** (~8 hrs): Global settings for contact info, business hours, etc.

## Hours for This Build

This build (Services CMS with public parity) took approximately **X hours** at $125/hr.
