# Local Database Testing

**Note**: Docker and PostgreSQL were not available in the Cloud Agent VM, so local database testing was conducted via the following validation:

1. **TypeScript Compilation**: ✅ Clean (0 errors)
2. **Unit Tests**: ✅ All 21 tests passing
3. **Production Build**: ✅ Successful
4. **Schema Validation**: ✅ Prisma schema generates without errors

## Migration Script

The migration adds these columns to the `Service` table (all optional or with defaults to preserve existing rows):

```sql
ALTER TABLE "Service" ADD COLUMN "slug" TEXT;
ALTER TABLE "Service" ADD COLUMN "outcome" TEXT;
ALTER TABLE "Service" ADD COLUMN "description" TEXT;
ALTER TABLE "Service" ADD COLUMN "price" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN "priceNote" TEXT;
ALTER TABLE "Service" ADD COLUMN "badgeText" TEXT;
ALTER TABLE "Service" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Service" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Service" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE INDEX "Service_slug_idx" ON "Service"("slug");
CREATE INDEX "Service_featured_idx" ON "Service"("featured");
CREATE INDEX "Service_deletedAt_idx" ON "Service"("deletedAt");
```

## Seed Script Idempotency Test

The seed script matches on `slug` and only inserts services that don't already exist:

```typescript
const existing = await prisma.service.findFirst({
  where: { slug: service.slug },
});

if (existing) {
  console.log(`  Service already exists: ${service.title}`);
} else {
  await prisma.service.create({ data: service });
}
```

Running `npm run db:seed` multiple times is safe and will not duplicate data.

## Manual Testing Steps for Roger

After the PR is merged and Roger wants to test locally:

1. Start a local Postgres (e.g., via Docker):
   ```bash
   docker run --name cerpamedia-test -e POSTGRES_PASSWORD=testpass -e POSTGRES_DB=cerpamedia -p 5432:5432 -d postgres:16
   ```

2. Set DATABASE_URL in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:testpass@localhost:5432/cerpamedia?schema=public"
   ```

3. Run migration:
   ```bash
   npx prisma migrate dev
   ```

4. Run seed twice to verify idempotency:
   ```bash
   npm run db:seed
   npm run db:seed
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

6. Visit `/admin/services` (log in at `/admin/login` first) to test the CMS.

The second seed run should report "Service already exists" for all 9 services (7 regular + AI Teammate Launch + Technology Strategy Call).
