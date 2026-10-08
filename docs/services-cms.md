# Services CMS

Complete content management system for the services shown on the public site.

## What's Editable

From `/admin/services`, Roger can:

- **Add new services** with full metadata
- **Edit existing services** (title, description, pricing, CTAs, SEO)
- **Reorder services** (up/down buttons or drag)
- **Publish/unpublish** services (toggle visibility)
- **Feature services** (show in special featured section)
- **Soft delete** services (hide from public and admin list, but preserve data)
- **Duplicate services** (create a copy as starting point)

### Service Fields

- **Title** and **Slug** (URL path)
- **Short Description** (one-line summary for cards)
- **Description** (full text shown on cards)
- **Outcome** (optional one-line benefit statement)
- **Price Label** (display text, e.g., "Starting at $5,000")
- **Price** (numeric value for sorting/filtering)
- **Price Note** (optional, e.g., "First 5 clients only")
- **Badge Text** (optional label shown on featured cards)
- **Featured** (show in featured section)
- **CTA Label** and **CTA URL**
- **Sort Order** (lower numbers appear first)
- **Published** (visible on public site)
- **SEO Title** and **SEO Description**

## Public Site Integration

The following pages read from the database with automatic fallback to hardcoded content if the DB is unavailable:

- **`/services`** — lists published, non-deleted services in sort order
- **`/` (home page)** — displays the AI Teammate Launch featured service teaser
- **`/services/ai-teammate-launch`** — page body is still hardcoded (only the card/teaser is editable)

### Fallback Behavior

If `DATABASE_URL` is not set or the DB is unreachable, the site renders the current hardcoded content so **the site never breaks**. This allows Vercel previews (which have no DATABASE_URL) to still render properly.

## Running the Migration and Seed in Production

**⚠️ DO NOT run these commands until Roger approves.**

The migration is **additive only** — it only adds new columns and does not drop or rename anything. Existing rows remain valid.

### Step 1: Create the Migration

If the migration file doesn't already exist:

```bash
npx prisma migrate dev --name add_service_cms_fields
```

### Step 2: Run the Migration in Production

```bash
npx prisma migrate deploy
```

This applies the schema changes to the production database.

### Step 3: Run the Seed Script

```bash
npm run db:seed
```

The seed script is **idempotent**:
- It matches services by `slug`
- Only inserts services that don't already exist
- Safe to run multiple times without duplicating data

After seeding, the 7 current public services plus the AI Teammate Launch featured card and Technology Strategy Call will be in the database with the exact current copy.

## Rollback

If something goes wrong:

1. **Public site automatically falls back** to hardcoded content if the DB is unavailable
2. **To undo the migration** (nuclear option, loses all CMS data):

```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

Replace `<migration-name>` with the migration folder name (e.g., `20261008_add_service_cms_fields`).

Then revert the `prisma/schema.prisma` changes and re-generate:

```bash
git checkout main -- prisma/schema.prisma
npx prisma generate
```

## Testing Locally

To test with a throwaway local Postgres:

1. **Start a local Postgres** (Docker or native):

```bash
docker run --name test-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
```

2. **Set the local DATABASE_URL** in `.env.local`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/cerpamedia_test?schema=public"
```

3. **Run the migration**:

```bash
npx prisma migrate dev
```

4. **Run the seed script twice** to verify idempotency:

```bash
npm run db:seed
npm run db:seed
```

The second run should report "Service already exists" for all services.

5. **Start the dev server**:

```bash
npm run dev
```

6. **Visit `/admin/services`** (log in first at `/admin/login`) to test the CMS.

## Phase 2 Options

Other content that could become editable (estimated hours at $125/hr, for reference only):

- **Home hero and CTAs** (2 hours) — Make the home page hero section and primary CTAs editable
- **FAQ** (3 hours) — Add a FAQ CMS with ordering and categories
- **Testimonials or proof** (4 hours) — Add a testimonials CMS with images and quotes
- **AI Teammate Launch full page body** (2 hours) — Make the entire AI Teammate Launch page editable (currently only the card is editable)
- **Insights editing improvements** (4 hours) — Add a rich text editor and image upload to the Insights CMS
- **Booking management actions** (6 hours) — Add cancel and reschedule actions from `/admin/bookings`
- **Site-wide settings** (3 hours) — Add a settings panel for contact email, phone, and footer content

**Core Services CMS estimate**: 12 hours actual (includes testing, documentation, and screenshots)

## Notes

- Customer-facing copy has not changed — all current public content is preserved exactly
- No SMS/text options added
- No street address added (only "CerpaMedia LLC, Woodstock, GA" shown publicly)
- The "coming in M2–M4" badge has been removed from `/admin/services`
