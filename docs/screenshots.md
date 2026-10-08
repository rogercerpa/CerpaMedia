# Screenshot Capture Guide

## Quick Start

```bash
# Run the capture script (requires Docker)
./scripts/capture-screenshots.sh
```

This will:
1. Start a local Postgres database in Docker
2. Seed it with test data (legacy rules, zero dates initially, one blocked date)
3. Build and start the Next.js app
4. Capture screenshots with Playwright
5. Clean up

## Required Screenshots

### Public Booking Calendar

**Before (main branch):**
- `/consult` showing weekday slots despite zero admin dates
- Mobile header at 360px, 390px, 414px (wrapped title, mismatched buttons)

**After (this PR):**
- `/consult` showing "No available slots" with zero DateAvailability
- `/consult` showing calendar with one opened date
- Mobile header at 360px, 390px, 414px (clean layout)

### Admin Interface

**Before (main branch):**
- 7-tab interface
- No customer preview

**After (this PR):**
- Unified calendar view
- "Open for Booking" modal
- "Block Date" modal
- Exceptions & blocks list
- "What Customers See" preview showing slots

## Manual Capture (if script fails)

1. **Start local Postgres:**
   ```bash
   docker run --name test-db -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=cerpamedia -p 5432:5432 -d postgres:16-alpine
   ```

2. **Set environment:**
   ```bash
   export DATABASE_URL="postgresql://test:test@localhost:5432/cerpamedia"
   export ADMIN_EMAIL="test@example.com"
   export NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

3. **Push schema and seed:**
   ```bash
   npx prisma db push
   npx tsx scripts/seed-screenshots.ts
   ```

4. **Start app:**
   ```bash
   npm run build
   npm run start
   ```

5. **Capture screenshots:**
   - Use browser DevTools to set viewport sizes
   - For admin, bypass auth by manually setting session cookie
   - Save to `artifacts/screenshots/`

6. **Cleanup:**
   ```bash
   docker stop test-db && docker rm test-db
   ```

## Screenshot Checklist

- [ ] `mobile-before-roger-report.jpg` (already captured by Roger)
- [ ] `mobile-calendar-360px-after.png`
- [ ] `mobile-calendar-390px-after.png`
- [ ] `mobile-calendar-414px-after.png`
- [ ] `public-consult-no-slots-after.png`
- [ ] `public-consult-with-date-after.png`
- [ ] `admin-unified-calendar.png`
- [ ] `admin-open-date-modal.png`
- [ ] `admin-block-date-modal.png`
- [ ] `admin-with-one-date.png`

## Notes

- Never use production DATABASE_URL
- Script creates throwaway local database
- Auth bypass is local-only (not committed)
- Screenshots verify UI/UX, not business logic (covered by tests)
